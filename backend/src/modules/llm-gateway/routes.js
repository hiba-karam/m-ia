const express = require('express');
const router = express.Router();
const axios = require('axios');
const tokenGuard = require('../../middlewares/tokenGuard');
const pool = require('../../config/db');
const SYSTEM_PROMPTS = require('../../config/prompts');

const { callOpenAI } = require('./adapters/openaiAdapter');
const { callClaude } = require('./adapters/claudeAdapter');
const { callGemini } = require('./adapters/geminiAdapter');

// 1. Définition des fournisseurs selon le Business Plan 
const PROVIDER_MAP = {
    'GENERAL': { name: 'ChatGPT', url: process.env.CHATGPT_API_URL, key: process.env.CHATGPT_API_KEY },
    'PROFESSIONAL': { name: 'Claude', url: process.env.CLAUDE_API_URL, key: process.env.CLAUDE_API_KEY },
    'MULTIMODAL': { name: 'Gemini', url: process.env.GEMINI_API_URL, key: process.env.GEMINI_API_KEY },
    'TECHNICAL': { name: 'DeepSeek', url: process.env.DEEPSEEK_API_URL, key: process.env.DEEPSEEK_API_KEY },
    'LONG_CONTEXT': { name: 'Kimi', url: process.env.KIMI_API_URL, key: process.env.KIMI_API_KEY }
};

// 2. Logique de routage dynamique avec Mode Automatique intelligent
const getProviderByUseCase = (useCase) => {
    // Si l'usage est défini explicitement
    switch (useCase) {
        case 'analyse_technique': return PROVIDER_MAP.TECHNICAL; // DeepSeek 
        case 'analyse_documents': return PROVIDER_MAP.LONG_CONTEXT; // Kimi 
        case 'analyse_multimodale': return PROVIDER_MAP.MULTIMODAL; // Gemini 
        case 'redaction_pro': return PROVIDER_MAP.PROFESSIONAL; // Claude 
        case 'auto': 
            // Mode automatique : Privilégier le moins cher par défaut,
            // Sauf si on détecte un besoin futur de passer sur un modèle premium.
            // Pour l'instant on map sur le général (économique).
            return PROVIDER_MAP.GENERAL; 
        default: return PROVIDER_MAP.GENERAL; // ChatGPT par défaut
    }
};

router.post('/chat', tokenGuard, async (req, res) => {
    const { prompt, useCase, userId } = req.body;
    
    // Détermination du fournisseur principal
    let provider = getProviderByUseCase(useCase);
    const systemInstruction = SYSTEM_PROMPTS[useCase] || SYSTEM_PROMPTS['default'];
    let aiResponse;
    let fallbackUsed = false;
    let actualProviderName = provider.name;
    
    try {
        // 3. Appel au fournisseur sélectionné via les Adaptateurs
        if (provider.name === 'Claude') {
            aiResponse = await callClaude(provider, systemInstruction, prompt);
        } else if (provider.name === 'Gemini') {
            aiResponse = await callGemini(provider, systemInstruction, prompt);
        } else {
            aiResponse = await callOpenAI(provider, systemInstruction, prompt);
        }
    } catch (primaryError) {
        console.warn(`[LLM Gateway] Échec avec ${provider.name}. Raison: ${primaryError.message}. Déclenchement du Fallback vers ChatGPT...`);
        fallbackUsed = true;
        // Fallback de secours (vers OpenAI GENERAL)
        provider = PROVIDER_MAP.GENERAL;
        actualProviderName = provider.name;
        try {
            aiResponse = await callOpenAI(provider, systemInstruction, prompt);
        } catch (fallbackError) {
            console.error("[LLM Gateway] Erreur critique : Le fallback a aussi échoué.", fallbackError.message);
            return res.status(502).json({ error: "Service IA indisponible, même après fallback." });
        }
    }

    try {
        // 4. Journalisation et Audit avec tokens réels
        await pool.execute(
            'INSERT INTO token_usage_logs (user_id, provider_name, model_name, use_case, status, input_tokens, output_tokens) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, actualProviderName, actualProviderName, useCase, 'allowed', aiResponse.usage.input_tokens, aiResponse.usage.output_tokens]
        );

        res.status(200).json({
            provider: actualProviderName,
            fallback_triggered: fallbackUsed,
            content: aiResponse.content,
            usage: aiResponse.usage
        });

    } catch (dbError) {
        console.error("[LLM Gateway] Erreur d'audit DB:", dbError.message);
        res.status(500).json({ error: "Erreur interne lors de la journalisation." });
    }
});

module.exports = router;