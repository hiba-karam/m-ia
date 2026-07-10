const PRICING_PER_1K_TOKENS = {
    'ChatGPT': { input: 0.00015, output: 0.00060 }, // GPT-4o-mini
    'Claude': { input: 0.003, output: 0.015 },      // Claude 3.5 Sonnet
    'Gemini': { input: 0.000075, output: 0.00030 }, // Gemini 1.5 Flash
    'DeepSeek': { input: 0.00014, output: 0.00028 },// DeepSeek-V3/Chat
    'Kimi': { input: 0.001, output: 0.001 }         // Moonshot-v1
};

module.exports = PRICING_PER_1K_TOKENS;
