const { sql } = require('../config/db');

const tokenGuard = async (req, res, next) => {
    const { userId, useCase, estimatedInputTokens, estimatedOutputTokens, provider } = req.body;

    try {
        const estimatedCost = calculateCost(estimatedInputTokens, estimatedOutputTokens, provider);

        const request = new sql.Request();
        request.input('user_id', sql.Int, userId);
        
        const result = await request.query(`
            SELECT SUM(estimated_cost) as total_spent 
            FROM token_usage_logs 
            WHERE user_id = @user_id AND status = 'allowed'
        `);
        
        const totalSpent = parseFloat(result.recordset[0].total_spent || 0);
        const budgetLimit = 1000;

        if ((totalSpent + estimatedCost) >= budgetLimit) {
            await logDecision(userId, useCase, provider, 'blocked', estimatedCost);
            return res.status(403).json({ action: 'BLOCK', reason: "Blocage automatique : Budget épuisé" });
        }

        if ((totalSpent + estimatedCost) >= (budgetLimit * 0.9)) {
            return res.status(403).json({ action: 'HUMAN_REQUIRED', reason: "Budget critique : Validation requise" });
        }

        if ((totalSpent + estimatedCost) >= (budgetLimit * 0.7)) {
            console.warn(`[Token Guard] Alerte : Utilisateur ${userId} atteint 70% du budget.`);
        }

        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur de gouvernance Token Guard." });
    }
};

function calculateCost(input, output, provider) {
    return 0.01;
}

async function logDecision(userId, useCase, provider, status, cost) {
    const request = new sql.Request();
    request.input('user_id', sql.Int, userId);
    request.input('provider_name', sql.NVarChar(80), provider);
    request.input('use_case', sql.NVarChar(80), useCase);
    request.input('estimated_cost', sql.Decimal(18,6), cost);
    request.input('status', sql.NVarChar(30), status);

    await request.query(`
        INSERT INTO token_usage_logs (user_id, provider_name, use_case, estimated_cost, status) 
        VALUES (@user_id, @provider_name, @use_case, @estimated_cost, @status)
    `);
}

module.exports = tokenGuard;