const { sql } = require('../../config/db');
const PRICING_PER_1K_TOKENS = require('../../config/pricing');

const checkQuota = async (req, res) => {
    try {
        const { service, useCase, provider, estimatedInputTokens, estimatedOutputTokens } = req.body;

        // Sécurité: ne jamais faire confiance à un userId venant du body.
        // L'utilisateur doit provenir du JWT (verifyToken).
        const uId = req.user?.id;
        if (!uId) {
            return res.status(401).json({ message: 'Non authentifié.' });
        }

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

const getUsage = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : req.query.userId || 1;

        const request = new sql.Request();
        request.input('user_id', sql.Int, userId);

        // Daily usage (today)
        const dailyResult = await request.query(`
            SELECT ISNULL(SUM(estimated_cost), 0) as daily_cost
            FROM token_usage_logs
            WHERE user_id = @user_id
              AND status = 'allowed'
              AND CAST(created_at AS DATE) = CAST(GETDATE() AS DATE)
        `);

        // Monthly usage
        const monthlyResult = await request.query(`
            SELECT ISNULL(SUM(estimated_cost), 0) as monthly_cost
            FROM token_usage_logs
            WHERE user_id = @user_id
              AND status = 'allowed'
              AND YEAR(created_at) = YEAR(GETDATE())
              AND MONTH(created_at) = MONTH(GETDATE())
        `);

        // Get monthly budget
        const budgetResult = await request.query(`
            SELECT tp.monthly_budget, tp.daily_token_limit
            FROM users u
            JOIN token_policies tp ON u.role_id = tp.role_id
            WHERE u.id = @user_id
        `);

        const dailyBudget = budgetResult.recordset[0]?.daily_token_limit || 20000;
        const monthlyBudget = budgetResult.recordset[0]?.monthly_budget || 50.0;
        const dailyCost = parseFloat(dailyResult.recordset[0]?.daily_cost || 0);
        const monthlyCost = parseFloat(monthlyResult.recordset[0]?.monthly_cost || 0);

        // Get usage history for chart (last 30 days)
        const historyResult = await request.query(`
            SELECT 
                CAST(created_at AS DATE) as date,
                SUM(estimated_cost) as cost,
                SUM(input_tokens + output_tokens) as tokens
            FROM token_usage_logs
            WHERE user_id = @user_id
              AND status = 'allowed'
              AND created_at >= DATEADD(DAY, -30, GETDATE())
            GROUP BY CAST(created_at AS DATE)
            ORDER BY date ASC
        `);

        const series = historyResult.recordset.map(row => ({
            date: row.date,
            cost: parseFloat(row.cost || 0),
            tokens: row.tokens || 0,
        }));

        res.status(200).json({
            series,
            remainingDailyTokens: Math.max(0, dailyBudget - dailyCost),
            dailyBudget: dailyBudget,
            remainingMonthlyBudget: Math.max(0, monthlyBudget - monthlyCost),
        });

    } catch (error) {
        console.error("Erreur SQL dans getUsage :", error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des statistiques." });
    }
};

module.exports = { checkQuota, getUsage };