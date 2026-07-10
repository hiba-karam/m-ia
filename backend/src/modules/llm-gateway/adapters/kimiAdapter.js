const axios = require('axios');

const callKimi = async (provider, systemInstruction, prompt) => {
    if (!provider.url || !provider.key) {
        console.log(`[Adapter] Simulation de l'appel API pour ${provider.name}`);
        return {
            content: `Ceci est une réponse simulée de ${provider.name}.`,
            usage: { input_tokens: 15, output_tokens: 25 }
        };
    }

    const response = await axios.post(provider.url, {
        model: 'moonshot-v1-8k',
        messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
        ]
    }, {
        headers: { 'Authorization': `Bearer ${provider.key}` }
    });

    return {
        content: response.data.choices[0].message.content,
        usage: {
            input_tokens: response.data.usage?.prompt_tokens || 0,
            output_tokens: response.data.usage?.completion_tokens || 0
        }
    };
};

module.exports = { callKimi };
