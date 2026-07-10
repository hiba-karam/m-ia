require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query, getPool } = require('../src/config/db');

async function main() {
    const email = process.env.ADMIN_EMAIL || 'admin@m-ia.local';
    const password = process.env.ADMIN_PASSWORD;

    if (!password) {
        console.error('ADMIN_PASSWORD est requis.');
        process.exit(1);
    }

    const role = await query('SELECT id FROM roles WHERE name = @name', { name: 'Admin' });
    if (!role.recordset[0]) {
        console.error('Rôle Admin introuvable. Exécutez d\'abord les scripts SQL.');
        process.exit(1);
    }

    const hash = await bcrypt.hash(password, 12);
    const existing = await query('SELECT id FROM users WHERE email = @email', { email });

    if (existing.recordset[0]) {
        await query(
            'UPDATE users SET password_hash = @hash, role_id = @roleId, auth_source = @authSource WHERE email = @email',
            { hash, roleId: role.recordset[0].id, authSource: 'local', email }
        );
        console.log(`Compte admin mis à jour : ${email}`);
    } else {
        await query(
            `INSERT INTO users (email, display_name, password_hash, role_id, auth_source, mfa_verified)
             VALUES (@email, @displayName, @hash, @roleId, @authSource, 0)`,
            {
                email,
                displayName: 'Administrateur M-IA',
                hash,
                roleId: role.recordset[0].id,
                authSource: 'local',
            }
        );
        console.log(`Compte admin créé : ${email}`);
    }

    const pool = await getPool();
    await pool.close();
}

main().catch((err) => {
    console.error(err.message);
    process.exit(1);
});
