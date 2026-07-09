const { sql } = require('../../config/db');

const checkQuota = async (req, res) => {
    try {
        const { userId, service, useCase, provider, estimatedInputTokens, estimatedOutputTokens } = req.body;
        
        const totalTokens = estimatedInputTokens + estimatedOutputTokens;
        const estimatedCost = (totalTokens / 1000) * 0.03; 

        const request = new sql.Request();
        request.input('user_id', sql.Int, userId);
        request.input('service_name', sql.NVarChar, service);
        request.input('provider_name', sql.NVarChar, provider);
        request.input('model_name', sql.NVarChar, 'claude-compatible-model'); 
        request.input('use_case', sql.NVarChar, useCase);
        request.input('input_tokens', sql.Int, estimatedInputTokens);
        request.input('output_tokens', sql.Int, estimatedOutputTokens);
        request.input('estimated_cost', sql.Decimal(18, 6), estimatedCost);
        request.input('status', sql.NVarChar, 'allowed');

        await request.query(`
            INSERT INTO token_usage_logs (user_id, service_name, provider_name, model_name, use_case, input_tokens, output_tokens, estimated_cost, status)
            VALUES (@user_id, @service_name, @provider_name, @model_name, @use_case, @input_tokens, @output_tokens, @estimated_cost, @status)
        `);

        res.status(200).json({
            allowed: true,
            selectedProvider: "Claude",
            selectedModel: "claude-compatible-model",
            remainingDailyTokens: 42000,
            remainingMonthlyBudget: 780.50,
            policyAction: "allow"
        });

    } catch (error) {
        console.error("Erreur SQL dans le Token Guard :", error);
        res.status(500).json({ message: "Erreur serveur lors de la vérification des quotas." });
    }
};

module.exports = { checkQuota };