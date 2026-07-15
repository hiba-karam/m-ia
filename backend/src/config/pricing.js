const PRICING_PER_1K_TOKENS = {
    'ChatGPT': { input: 0.00015, output: 0.00060 }, 
    'Claude': { input: 0.003, output: 0.015 },      
    'Gemini': { input: 0.000075, output: 0.00030 }, 
    'DeepSeek': { input: 0.00014, output: 0.00028 },
    'Kimi': { input: 0.001, output: 0.001 }         
};

module.exports = PRICING_PER_1K_TOKENS;
