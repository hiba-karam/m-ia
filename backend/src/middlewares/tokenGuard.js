const pool = require('../config/db');

/**
 * Middleware Token Guard : Gouvernance et contrôle FinOps
 * Effectue le pré-check obligatoire avant chaque appel IA
 */
const tokenGuard = async (req, res, next) => {
    const { userId, useCase, estimatedInputTokens, estimatedOutputTokens, provider } = req.body;

    try {
        // 1. Calcul du coût estimé basé sur les tokens
        // Note: Les tarifs doivent être définis selon le fournisseur (ChatGPT/Claude/etc.)
        const estimatedCost = calculateCost(estimatedInputTokens, estimatedOutputTokens, provider);

        // 2. Récupération de la consommation réelle en base de données
        const [rows] = await pool.execute(
            'SELECT SUM(estimated_cost) as total_spent FROM token_usage_logs WHERE user_id = ? AND status = "allowed"',
            [userId]
        );
        const totalSpent = parseFloat(rows[0].total_spent || 0);

        // 3. Logique de décision conforme au cahier des charges
        const budgetLimit = 1000; // Seuil défini en configuration

        // Seuil 100% : Blocage automatique
        if ((totalSpent + estimatedCost) >= budgetLimit) {
            await logDecision(userId, useCase, provider, 'blocked', estimatedCost);
            return res.status(403).json({ action: 'BLOCK', reason: "Blocage automatique : Budget épuisé" });
        }

        // Seuil 90% : Restriction / Validation requise
        if ((totalSpent + estimatedCost) >= (budgetLimit * 0.9)) {
            return res.status(403).json({ action: 'HUMAN_REQUIRED', reason: "Budget critique : Validation requise" });
        }

        // Seuil 70% : Alerte (Journalisation simple)
        if ((totalSpent + estimatedCost) >= (budgetLimit * 0.7)) {
            console.warn(`[Token Guard] Alerte : Utilisateur ${userId} atteint 70% du budget.`);
        }

        // 4. Autorisation : Si tout est conforme, on passe à l'appel IA
        next();
    } catch (err) {
        res.status(500).json({ error: "Erreur de gouvernance Token Guard." });
    }
};

// Logique de calcul interne
function calculateCost(input, output, provider) {
    // Formule : (input/1000 * prixInput) + (output/1000 * prixOutput)
    return 0.01; // Exemple de coût calculé
}

// Logique de journalisation de la décision
async function logDecision(userId, useCase, provider, status, cost) {
    await pool.execute(
        'INSERT INTO token_usage_logs (user_id, provider_name, use_case, estimated_cost, status) VALUES (?, ?, ?, ?, ?)',
        [userId, provider, useCase, cost, status]
    );
}

module.exports = tokenGuard;