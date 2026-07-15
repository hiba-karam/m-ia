const bcrypt = require('bcrypt');
const { sql, connectDB } = require('./src/config/db');
const setupAdminPassword = async () => {
    try {
        await connectDB();        
        const plainPassword = 'm_ia_m_automotiv';        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);
        console.log('Mot de passe crypte avec succes :', hashedPassword);
        const request = new sql.Request();
        await request.query(`
            UPDATE users 
            SET password_hash = '${hashedPassword}' 
            WHERE email = 'admin@m-automotiv.ma'
        `);
        console.log('Le mot de passe de l\'admin a ete mis a jour dans SQL Server !');
        process.exit(0);
    } catch (error) {
        console.error('Erreur :', error);
        process.exit(1);
    }
};
setupAdminPassword();