const checkQuota = async (req, res) => {
    try {
        res.status(200).json({ status: "success", message: "Quota autorisé." });
    } catch (error) {
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

module.exports = { checkQuota };