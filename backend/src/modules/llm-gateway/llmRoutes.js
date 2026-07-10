const express = require('express');
const router = express.Router();
const axios = require('axios');
const tokenGuard = require('../../middlewares/tokenGuard');
const verifyToken = require('../../middlewares/authMiddleware');
const { sql } = require('../../config/db');
const SYSTEM_PROMPTS = require('../../config/prompts');

const { callOpenAI } = require('./adapters/openaiAdapter');
const { callClaude } = require('./adapters/claudeAdapter');
const { callGemini } = require('./adapters/geminiAdapter');

const PROVIDER_MAP = {
    'GENERAL': { name: 'ChatGPT', url: process.env.CHATGPT_API_URL, key: process.env.CHATGPT_API_KEY },
    'PROFESSIONAL': { name: 'Claude', url: process.env.CLAUDE_API_URL, key: process.env.CLAUDE_API_KEY },
    'MULTIMODAL': { name: 'Gemini', url: process.env.GEMINI_API_URL, key: process.env.GEMINI_API_KEY },
    'TECHNICAL': { name: 'DeepSeek', url: process.env.DEEPSEEK_API_URL, key: process.env.DEEPSEEK_API_KEY },
    'LONG_CONTEXT': { name: 'Kimi', url: process.env.KIMI_API_URL, key: process.env.KIMI_API_KEY }
};

// Tarification au 1000 tokens (basé sur le marché réel en $)
const PRICING_PER_1K_TOKENS = {
    'ChatGPT': { input: 0.00015, output: 0.00060 }, // GPT-4o-mini
    'Claude': { input: 0.003, output: 0.015 },      // Claude 3.5 Sonnet
    'Gemini': { input: 0.000075, output: 0.00030 }, // Gemini 1.5 Flash
    'DeepSeek': { input: 0.00014, output: 0.00028 },// DeepSeek-V3/Chat
    'Kimi': { input: 0.001, output: 0.001 }         // Moonshot-v1 (estimé)
};

const getProviderByUseCase = (useCase) => {
    switch (useCase) {
        case 'analyse_technique': return PROVIDER_MAP.TECHNICAL; 
        case 'analyse_documents': return PROVIDER_MAP.LONG_CONTEXT; 
        case 'analyse_multimodale': return PROVIDER_MAP.MULTIMODAL; 
        case 'redaction_pro': return PROVIDER_MAP.PROFESSIONAL; 
        case 'auto': return PROVIDER_MAP.GENERAL; 
        default: return PROVIDER_MAP.GENERAL; 
    }
};

router.post('/sessions', verifyToken, async (req, res) => {
    try {
        const userId = req.user ? req.user.id : req.body.userId;
        const { title } = req.body;

        if (!userId) {
            return res.status(400).json({ message : "L'identifiant de l'utilisateur est requis." });
        }

        const request = new sql.Request();
        request.input('user_id', sql.Int, userId);
        request.input('title', sql.NVarChar(255), title || 'Nouvelle conversation');

        const result = await request.query(`
            INSERT INTO chat_sessions (user_id, title)
            OUTPUT INSERTED.id, INSERTED.title, INSERTED.created_at
            VALUES (@user_id, @title)
        `);

        res.status(201).json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ message : "Erreur serveur." });
    }
});

router.get('/sessions/:sessionId/messages', verifyToken, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const request = new sql.Request();
        request.input('session_id', sql.BigInt, sessionId);

        const result = await request.query(`
            SELECT id, role, content, model_used, created_at
            FROM chat_messages
            WHERE session_id = @session_id
            ORDER BY created_at ASC
        `);

        res.status(200).json(result.recordset);
    } catch (error) {
        res.status(500).json({ message : "Erreur serveur." });
    }
});

router.post('/chat', tokenGuard, async (req, res) => {
    const { prompt, useCase, sessionId } = req.body;
    const userId = req.user ? req.user.id : req.body.userId;
    
    let provider = getProviderByUseCase(useCase);
    const systemInstruction = SYSTEM_PROMPTS ? (SYSTEM_PROMPTS[useCase] || SYSTEM_PROMPTS['default']) : "";
    let aiResponse;
    let fallbackUsed = false;
    let actualProviderName = provider.name;
    
    try {
        if (sessionId) {
            const reqUserMsg = new sql.Request();
            reqUserMsg.input('session_id', sql.BigInt, sessionId);
            reqUserMsg.input('role', sql.NVarChar(50), 'user');
            reqUserMsg.input('content', sql.NVarChar(sql.MAX), prompt);
            await reqUserMsg.query(`INSERT INTO chat_messages (session_id, role, content) VALUES (@session_id, @role, @content)`);
        }

        if (provider.name === 'Claude') {
            aiResponse = await callClaude(provider, systemInstruction, prompt);
        } else if (provider.name === 'Gemini') {
            aiResponse = await callGemini(provider, systemInstruction, prompt);
        } else {
            aiResponse = await callOpenAI(provider, systemInstruction, prompt);
        }
    } catch (primaryError) {
        fallbackUsed = true;
        provider = PROVIDER_MAP.GENERAL;
        actualProviderName = provider.name;
        try {
            aiResponse = await callOpenAI(provider, systemInstruction, prompt);
        } catch (fallbackError) {
            return res.status(502).json({ error : "Service IA indisponible." });
        }
    }

    try {
        if (sessionId) {
            const reqAiMsg = new sql.Request();
            reqAiMsg.input('session_id', sql.BigInt, sessionId);
            reqAiMsg.input('role', sql.NVarChar(50), 'assistant');
            reqAiMsg.input('content', sql.NVarChar(sql.MAX), aiResponse.content);
            reqAiMsg.input('model_used', sql.NVarChar(120), actualProviderName);
            await reqAiMsg.query(`INSERT INTO chat_messages (session_id, role, content, model_used) VALUES (@session_id, @role, @content, @model_used)`);
        }

        const inputTokens = aiResponse.usage ? aiResponse.usage.input_tokens : 0;
        const outputTokens = aiResponse.usage ? aiResponse.usage.output_tokens : 0;

        let estimatedCost = 0;
        const providerPricing = PRICING_PER_1K_TOKENS[actualProviderName];
        if (providerPricing) {
            estimatedCost = ((inputTokens / 1000) * providerPricing.input) + ((outputTokens / 1000) * providerPricing.output);
        }

        const reqAudit = new sql.Request();
        reqAudit.input('user_id', sql.Int, userId);
        reqAudit.input('provider_name', sql.NVarChar(80), actualProviderName);
        reqAudit.input('model_name', sql.NVarChar(120), actualProviderName);
        reqAudit.input('use_case', sql.NVarChar(80), useCase || 'auto');
        reqAudit.input('status', sql.NVarChar(30), 'allowed');
        reqAudit.input('input_tokens', sql.Int, inputTokens);
        reqAudit.input('output_tokens', sql.Int, outputTokens);
        reqAudit.input('estimated_cost', sql.Decimal(18,6), estimatedCost);
        
        await reqAudit.query(`
            INSERT INTO token_usage_logs (user_id, provider_name, model_name, use_case, status, input_tokens, output_tokens, estimated_cost)
            VALUES (@user_id, @provider_name, @model_name, @use_case, @status, @input_tokens, @output_tokens, @estimated_cost)
        `);

        res.status(200).json({
            provider: actualProviderName,
            fallback_triggered: fallbackUsed,
            content: aiResponse.content,
            usage: aiResponse.usage
        });

    } catch (dbError) {
        res.status(500).json({ error : "Erreur interne lors de la journalisation." });
    }
});

module.exports = router;