const authConfig = require('../../config/authConfig');
const {
    authenticateLocal,
    buildAuthResponse,
    resolveRoleFromGroups,
    upsertSsoUser,
    findUserByEmail,
} = require('./authService'); 
const { authenticateLdap } = require('./providers/ldapProvider');
const { getAuthorizationUrl, handleOidcCallback } = require('./providers/oidcProvider');
const { getSamlLoginUrl, handleSamlCallback } = require('./providers/samlProvider');

async function login(req, res) {
    try {
        const { email, username, password, mode } = req.body;
        let user;

        const loginMode = (mode || authConfig.authMode).toLowerCase();

        if (loginMode === 'ldap') {
            if (!username || !password) {
                return res.status(400).json({ error: 'username et password requis pour LDAP.' });
            }
            user = await authenticateLdap(username, password);
        } else {
            if (!authConfig.localLoginEnabled) {
                return res.status(403).json({ error: 'Login local désactivé. Utilisez le SSO.' });
            }
            if (!email || !password) {
                return res.status(400).json({ error: 'email et password requis.' });
            }
            user = await authenticateLocal(email, password);
        }

        const response = await buildAuthResponse(user, req);
        return res.json(response);
    } catch (error) {
        return res.status(401).json({ error: error.message });
    }
}

async function ssoLogin(req, res) {
    try {
        const mode = (req.query.mode || authConfig.authMode).toLowerCase();

        if (mode === 'oidc') {
            const { url } = await getAuthorizationUrl();
            return res.redirect(url);
        }

        if (mode === 'saml') {
            const url = await getSamlLoginUrl();
            return res.redirect(url);
        }

        return res.status(400).json({
            error: 'Mode SSO non supporté. Utilisez mode=oidc ou mode=saml.',
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

async function samlCallback(req, res) {
    req.query.mode = 'saml';
    return ssoCallback(req, res);
}

async function ssoCallback(req, res) {
    try {
        const mode = (req.query.mode || 'oidc').toLowerCase();
        let identity;

        if (mode === 'oidc') {
            identity = await handleOidcCallback(req.query);
        } else if (mode === 'saml') {
            identity = await handleSamlCallback(req.body);
        } else {
            return res.status(400).json({ error: 'Callback SSO invalide.' });
        }

        if (!identity.email) {
            return res.status(400).json({ error: 'Email non fourni par le fournisseur SSO.' });
        }

        const role = await resolveRoleFromGroups(mode, identity.groups);
        const user = await upsertSsoUser({
            email: identity.email,
            displayName: identity.displayName,
            authSource: mode,
            roleId: role.id,
            mfaVerified: identity.mfaVerified,
        });

        const response = await buildAuthResponse(user, req);
        return res.json(response);
    } catch (error) {
        return res.status(401).json({ error: error.message });
    }
}

async function me(req, res) {
    try {
        const user = await findUserByEmail(req.user.email);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur introuvable.' });
        }

        return res.json({
            id: user.id,
            email: user.email,
            displayName: user.display_name,
            role: user.role_name,
            authSource: user.auth_source,
            permissions: JSON.parse(user.permissions || '[]'),
            mfaVerified: Boolean(user.mfa_verified),
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

async function providers(req, res) {
    return res.json({
        authMode: authConfig.authMode,
        localLoginEnabled: authConfig.localLoginEnabled,
        supported: ['local', 'oidc', 'saml', 'ldap'],
        mfaRequiredForAdmin: authConfig.mfaRequiredForAdmin,
    });
}

module.exports = { login, ssoLogin, ssoCallback, samlCallback, me, providers };