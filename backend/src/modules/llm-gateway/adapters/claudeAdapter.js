const axios = require('axios');

const callClaude = async (provider, systemInstruction, prompt) => {
    if (!provider.url || !provider.key) {
        console.log(`[Adapter] Simulation de l'appel API pour ${provider.name}`);
        return {
            content: `Ceci est une réponse simulée de ${provider.name}.`,
            usage: { input_tokens: 15, output_tokens: 25 }
        };
    }

    const response = await axios.post(provider.url, {
        model: 'claude-3-sonnet-20240229',
        system: systemInstruction, // Anthropic gère le system prompt séparément
        messages: [
            { role: 'user', content: prompt }
        ],
        max_tokens: 1000
    }, {
        headers: { 
            'x-api-key': provider.key,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
        }
    });

    return {
        content: response.data.content[0].text,
        usage: {
            input_tokens: response.data.usage?.input_tokens || 0,
            output_tokens: response.data.usage?.output_tokens || 0
        }
    };
};

module.exports = { callClaude };
