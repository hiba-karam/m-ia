const { sql } = require('../../config/db');
const checkTokenQuota = async (req, res) => {
    try {
        const { userId, service, useCase, provider, estimatedInputTokens, estimatedOutputTokens } = req.body;
        const DAILY_LIMIT = 50000;
        const totalEstimatedTokens = estimatedInputTokens + estimatedOutputTokens;
        const request = new sql.Request();
        request.input('userId', sql.Int, userId);
        const query = `
            SELECT ISNULL(SUM(input_tokens + output_tokens), 0) as used_today
            FROM token_usage_logs
            WHERE user_id = @userId 
            AND CAST(created_at AS DATE) = CAST(GETDATE() AS DATE)
            AND status = 'allowed'
        `;
        const result = await request.query(query);
        const usedToday = result.recordset[0].used_today;
        const remainingTokens = DAILY_LIMIT - usedToday;
        if (totalEstimatedTokens > remainingTokens) {
            return res.status(403).json({
                allowed: false,
                policyAction: "block",
                message: "Quota quotidien depasse."
            });
        }
        res.status(200).json({
            allowed: true,
            selectedProvider: provider === 'auto' ? 'Claude' : provider,
            selectedModel: "claude-compatible-model",
            remainingDailyTokens: remainingTokens - totalEstimatedTokens,
            remainingMonthlyBudget: 780.50, 
            policyAction: "allow"
        });
    } catch (error) {
        console.error('Erreur Token Guard:', error);
        res.status(500).json({ message: 'Erreur interne du serveur lors de la verification des tokens.' });
    }
};
module.exports = { checkTokenQuota };