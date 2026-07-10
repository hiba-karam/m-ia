const axios = require('axios');

const callDeepSeek = async (provider, systemInstruction, prompt) => {
    if (!provider.url || !provider.key) {
        console.log(`[Adapter] Simulation de l'appel API pour ${provider.name}`);
        return {
            content: `Ceci est une réponse simulée de ${provider.name}.`,
            usage: { input_tokens: 15, output_tokens: 25 }
        };
    }

    const response = await axios.post(provider.url, {
        model: 'deepseek-chat',
        messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" } // DeepSeek supports JSON mode
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

module.exports = { callDeepSeek };
