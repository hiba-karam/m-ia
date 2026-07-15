const express = require('express');
const router = express.Router();
const tokenGuard = require('../middlewares/tokenGuard');
const { sql } = require('../../config/db');

// Adaptateurs
const openaiAdapter = require('./adapters/openaiAdapter');
const claudeAdapter = require('./adapters/claudeAdapter');
const geminiAdapter = require('./adapters/geminiAdapter');
const prompts = require('../../config/prompts');

// 1. Liste des fournisseurs IA supportés (Configuration centralisée)
const PROVIDER_MAP = {
    CHATGPT: { name: 'ChatGPT', key: process.env.CHATGPT_API_KEY, url: process.env.CHATGPT_API_URL, adapter: openaiAdapter.callOpenAI },
    CLAUDE: { name: 'Claude', key: process.env.CLAUDE_API_KEY, url: process.env.CLAUDE_API_URL, adapter: claudeAdapter.callClaude },
    GEMINI: { name: 'Gemini', key: process.env.GEMINI_API_KEY, url: process.env.GEMINI_API_URL, adapter: geminiAdapter.callGemini },
    TECHNICAL: { name: 'DeepSeek', key: process.env.DEEPSEEK_API_KEY, url: process.env.DEEPSEEK_API_URL, adapter: openaiAdapter.callOpenAI }
};

// 2. Logique de routage dynamique avec Mode Automatique intelligent
const getProviderByUseCase = (useCase) => {
    switch (useCase) {
        case 'analyse_technique': return PROVIDER_MAP.TECHNICAL; // DeepSeek 
        case 'analyse_documents': return PROVIDER_MAP.CLAUDE;
        case 'redaction_pro': return PROVIDER_MAP.CHATGPT;
        case 'multimodal': return PROVIDER_MAP.GEMINI;
        default: return PROVIDER_MAP.CHATGPT; // Fallback par défaut économique
    }
};

/**
 * Route principale d'accès à l'IA
 * POST /api/llm/chat
 */
router.post('/chat', tokenGuard, async (req, res) => {
    const { userId, useCase, prompt, provider: requestedProvider } = req.body;

    try {
        let providerConfig;
        
        // Mode "auto" : M-IA choisit le meilleur rapport qualité/prix
        if (requestedProvider === 'auto' || !requestedProvider) {
            providerConfig = getProviderByUseCase(useCase);
            console.log(`[LLM Gateway] Mode Auto : Routage de '${useCase}' vers ${providerConfig.name}`);
        } else {
            // Mode manuel imposé par l'utilisateur (si autorisé)
            providerConfig = Object.values(PROVIDER_MAP).find(p => p.name.toLowerCase() === requestedProvider.toLowerCase());
            if (!providerConfig) {
                return res.status(400).json({ error: "Fournisseur IA non reconnu." });
            }
        }

        // Récupération du prompt système
        const systemInstruction = prompts.getSystemPrompt(useCase);

        let aiResponse;
        
        // 3. Exécution de l'appel IA avec mécanisme de FALLBACK (Tolérance aux pannes)
        try {
            console.log(`[LLM Gateway] Appel à ${providerConfig.name}...`);
            aiResponse = await providerConfig.adapter(providerConfig, systemInstruction, prompt);
        } catch (adapterError) {
            console.error(`[LLM Gateway] Échec de l'appel à ${providerConfig.name} :`, adapterError.message);
            
            // Si le fournisseur plante et que ce n'est pas déjà ChatGPT, on utilise ChatGPT en secours
            if (providerConfig.name !== 'ChatGPT') {
                console.log(`[LLM Gateway] Démarrage du Fallback automatique vers ChatGPT...`);
                providerConfig = PROVIDER_MAP.CHATGPT;
                aiResponse = await providerConfig.adapter(providerConfig, systemInstruction, prompt);
            } else {
                throw adapterError; // Si ChatGPT plante aussi, on lève l'erreur
            }
        }

        // 4. Enregistrement officiel de la consommation après succès
        await sql.query`
            INSERT INTO token_usage_logs 
            (user_id, provider_name, model_name, use_case, input_tokens, output_tokens, status) 
            VALUES 
            (${userId}, ${providerConfig.name}, 'auto-detected', ${useCase}, ${aiResponse.usage.input_tokens}, ${aiResponse.usage.output_tokens}, 'allowed')
        `;

        // 5. Retour des données au client
        res.json({
            provider_used: providerConfig.name,
            response: aiResponse.content,
            usage: aiResponse.usage
        });

    } catch (err) {
        console.error("Erreur critique dans le LLM Gateway :", err);
        res.status(500).json({ error: "Échec de l'appel au fournisseur IA." });
    }
});

module.exports = router;