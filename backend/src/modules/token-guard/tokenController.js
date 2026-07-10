const { sql } = require('../../config/db');
const PRICING_PER_1K_TOKENS = require('../../config/pricing');

const checkQuota = async (req, res) => {
    try {
        const { userId, service, useCase, provider, estimatedInputTokens, estimatedOutputTokens } = req.body;
        
        const uId = userId || 1;
        const rates = PRICING_PER_1K_TOKENS[provider] || PRICING_PER_1K_TOKENS['ChatGPT'];
        const inputCost = ((estimatedInputTokens || 0) / 1000) * rates.input;
        const outputCost = ((estimatedOutputTokens || 0) / 1000) * rates.output;
        const estimatedCost = inputCost + outputCost;

        const request = new sql.Request();
        request.input('user_id', sql.Int, uId);
        
        const resultStats = await request.query(`
            SELECT 
                (SELECT SUM(estimated_cost) FROM token_usage_logs WHERE user_id = @user_id AND status = 'allowed') as total_spent,
                (SELECT tp.monthly_budget FROM users u JOIN token_policies tp ON u.role_id = tp.role_id WHERE u.id = @user_id) as budget
        `);
        
        const totalSpent = parseFloat(resultStats.recordset[0].total_spent || 0);
        const budget = resultStats.recordset[0].budget != null ? parseFloat(resultStats.recordset[0].budget) : 50.0;
        const remainingBudget = Math.max(0, budget - totalSpent - estimatedCost);
        
        let status = 'allowed';
        let action = 'allow';
        
        if (totalSpent + estimatedCost >= budget) {
            status = 'blocked';
            action = 'block';
        }

        request.input('service_name', sql.NVarChar, service || 'Global');
        request.input('provider_name', sql.NVarChar, provider || 'ChatGPT');
        request.input('model_name', sql.NVarChar, provider || 'ChatGPT'); 
        request.input('use_case', sql.NVarChar, useCase || 'auto');
        request.input('input_tokens', sql.Int, estimatedInputTokens || 0);
        request.input('output_tokens', sql.Int, estimatedOutputTokens || 0);
        request.input('estimated_cost', sql.Decimal(18, 6), estimatedCost);
        request.input('status', sql.NVarChar, status);

        await request.query(`
            INSERT INTO token_usage_logs (user_id, service_name, provider_name, model_name, use_case, input_tokens, output_tokens, estimated_cost, status)
            VALUES (@user_id, @service_name, @provider_name, @model_name, @use_case, @input_tokens, @output_tokens, @estimated_cost, @status)
        `);

        if (status === 'blocked') {
            return res.status(403).json({ allowed: false, policyAction: "block", remainingMonthlyBudget: 0 });
        }

        res.status(200).json({
            allowed: true,
            selectedProvider: provider || "ChatGPT",
            selectedModel: provider || "ChatGPT",
            remainingDailyTokens: -1, 
            remainingMonthlyBudget: remainingBudget,
            policyAction: action
        });

    } catch (error) {
        console.error("Erreur SQL dans le Token Guard :", error);
        res.status(500).json({ message: "Erreur serveur lors de la vérification des quotas." });
    }
};

module.exports = { checkQuota };