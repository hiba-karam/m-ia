const { sql } = require('../config/db');
const PRICING_PER_1K_TOKENS = require('../config/pricing');

const tokenGuard = async (req, res, next) => {
    const { useCase, estimatedInputTokens, estimatedOutputTokens, provider } = req.body;

    // Sécurité: ignorer tout userId fourni par le client et ne faire confiance
    // qu'à l'utilisateur authentifié par le JWT.
    const uId = req.user?.id;
    if (!uId) {
        return res.status(401).json({ error: "Non authentifié." });
    }


    try {
        const estimatedCost = calculateCost(estimatedInputTokens, estimatedOutputTokens, provider);

        const request = new sql.Request();
        request.input('user_id', sql.Int, uId);
        
        const resultSpent = await request.query(`
            SELECT SUM(estimated_cost) as total_spent 
            FROM token_usage_logs 
            WHERE user_id = @user_id AND status = 'allowed'
        `);
        const totalSpent = parseFloat(resultSpent.recordset[0].total_spent || 0);

        const resultBudget = await request.query(`
            SELECT tp.monthly_budget 
            FROM users u
            JOIN token_policies tp ON u.role_id = tp.role_id
            WHERE u.id = @user_id
        `);
        
        const budgetLimit = resultBudget.recordset.length > 0 && resultBudget.recordset[0].monthly_budget != null 
                            ? parseFloat(resultBudget.recordset[0].monthly_budget) 
                            : 50.0;

        if ((totalSpent + estimatedCost) >= budgetLimit) {
            await logDecision(uId, useCase, provider, 'blocked', estimatedCost);

            return res.status(403).json({ action: 'BLOCK', reason: "Blocage automatique : Budget épuisé" });
        }

        if ((totalSpent + estimatedCost) >= (budgetLimit * 0.9)) {
            return res.status(403).json({ action: 'HUMAN_REQUIRED', reason: "Budget critique : Validation requise" });
        }

        if ((totalSpent + estimatedCost) >= (budgetLimit * 0.7)) {
            console.warn(`[Token Guard] Alerte : Utilisateur ${uId} atteint 70% du budget.`);
        }


        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur de gouvernance Token Guard." });
    }
};

function calculateCost(input, output, provider) {
    const rates = PRICING_PER_1K_TOKENS[provider] || PRICING_PER_1K_TOKENS['ChatGPT'];
    const inputCost = ((input || 0) / 1000) * rates.input;
    const outputCost = ((output || 0) / 1000) * rates.output;
    return inputCost + outputCost;
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