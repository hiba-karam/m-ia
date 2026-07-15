const axios = require('axios');

const callGemini = async (provider, systemInstruction, prompt) => {
    if (!provider.url || !provider.key) {
        console.log(`[Adapter] Simulation de l'appel API pour ${provider.name}`);
        return {
            content: `Ceci est une réponse simulée de ${provider.name}.`,
            usage: { input_tokens: 15, output_tokens: 25 }
        };
    }

    const urlWithKey = `${provider.url}?key=${provider.key}`;

    const response = await axios.post(urlWithKey, {
        system_instruction: {
            parts: [{ text: systemInstruction }]
        },
        contents: [{
            parts: [{ text: prompt }]
        }]
    }, {
        headers: { 'Content-Type': 'application/json' }
    });

    const content = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "Réponse vide de Gemini";
    const usage = response.data.usageMetadata || {};

    return {
        content: content,
        usage: {
            input_tokens: usage.promptTokenCount || 0,
            output_tokens: usage.candidatesTokenCount || 0
        }
    };
};

module.exports = { callGemini };
