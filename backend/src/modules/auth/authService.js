const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../../config/db');
const authConfig = require('../../config/authConfig');

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

function hashBody(content) {
    return crypto.createHash('sha256').update(content || '').digest();
}

async function findUserByEmail(email) {
    const result = await query(
        `SELECT u.id, u.email, u.name, u.password_hash, u.auth_source,
                u.is_active, u.mfa_verified, r.name AS role_name, r.permissions
         FROM users u
         INNER JOIN roles r ON r.id = u.role_id
         WHERE u.email = @email`,
        { email }
    );
    return result.recordset[0] || null;
}

async function resolveRoleFromGroups(provider, groups = []) {
    if (!groups.length) {
        const defaultRole = await query(
            'SELECT id, name, permissions FROM roles WHERE name = @name',
            { name: authConfig.defaultRoleName }
        );
        return defaultRole.recordset[0];
    }

    const requestParams = { provider };
    const inClause = groups.map((group, index) => {
        const key = `group${index}`;
        requestParams[key] = group;
        return `@${key}`;
    }).join(', ');

    const result = await query(
        `SELECT TOP 1 r.id, r.name, r.permissions, m.group_name
         FROM sso_group_mappings m
         INNER JOIN roles r ON r.id = m.role_id
         WHERE m.sso_provider = @provider
           AND m.group_name IN (${inClause})
         ORDER BY r.id ASC`,
        requestParams
    );

    if (result.recordset[0]) return result.recordset[0];

    const fallback = await query(
        'SELECT id, name, permissions FROM roles WHERE name = @name',
        { name: authConfig.defaultRoleName }
    );
    return fallback.recordset[0];
}

async function upsertSsoUser({ email, displayName, authSource, roleId, mfaVerified }) {
    const existing = await findUserByEmail(email);
    if (existing) {
        await query(
            `UPDATE users SET name = @displayName, role_id = @roleId,
                    auth_source = @authSource, mfa_verified = @mfaVerified,
                    is_active = 1
             WHERE id = @id`,
            {
                displayName,
                roleId,
                authSource,
                mfaVerified: mfaVerified ? 1 : 0,
                id: existing.id,
            }
        );
        return findUserByEmail(email);
    }

    await query(
        `INSERT INTO users (email, name, role_id, auth_source, mfa_verified)
         VALUES (@email, @displayName, @roleId, @authSource, @mfaVerified)`,
        {
            email,
            displayName,
            roleId,
            authSource,
            mfaVerified: mfaVerified ? 1 : 0,
        }
    );
    return findUserByEmail(email);
}

async function createSession(userId, req) {
    const refreshToken = crypto.randomBytes(48).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + authConfig.refreshExpiresInDays);

    await query(
        `INSERT INTO sessions (user_id, refresh_token, refresh_token_hash, ip_address, user_agent, expires_at)
         VALUES (@userId, @token, @hash, @ip, @ua, @expiresAt)`,
        {
            userId,
            token: refreshToken,
            hash: hashToken(refreshToken),
            ip: req.ip || null,
            ua: (req.headers['user-agent'] || '').slice(0, 500),
            expiresAt,
        }
    );

    return refreshToken;
}

function issueAccessToken(user) {
    const permissions = JSON.parse(user.permissions || '[]');
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            role: user.role_name,
            permissions,
            authSource: user.auth_source,
        },
        authConfig.jwtSecret,
        { expiresIn: authConfig.jwtExpiresIn }
    );
}

async function authenticateLocal(email, password) {
    const user = await findUserByEmail(email);
    if (!user || !user.password_hash) {
        throw new Error('Identifiants invalides.');
    }
    if (!user.is_active) {
        throw new Error('Compte désactivé.');
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
        throw new Error('Identifiants invalides.');
    }

    if (authConfig.mfaRequiredForAdmin && user.role_name === 'Admin M-IA' && !user.mfa_verified) {
        throw new Error('MFA requis pour le compte administrateur.');
    }

    return user;
}

async function buildAuthResponse(user, req) {
    const accessToken = issueAccessToken(user);
    const refreshToken = await createSession(user.id, req);

    return {
        accessToken,
        refreshToken,
        expiresIn: authConfig.jwtExpiresIn,
        user: {
            id: user.id,
            email: user.email,
            displayName: user.name,
            role: user.role_name,
            authSource: user.auth_source,
            permissions: JSON.parse(user.permissions || '[]'),
        },
    };
}

module.exports = {
    hashToken,
    hashBody,
    findUserByEmail,
    resolveRoleFromGroups,
    upsertSsoUser,
    createSession,
    issueAccessToken,
    authenticateLocal,
    buildAuthResponse,
};