const { Issuer, generators } = require('openid-client');
const authConfig = require('../../../config/auth.config');

let oidcClient = null;
const pendingStates = new Map();

async function getOidcClient() {
    if (oidcClient) return oidcClient;

    const { issuer, clientId, clientSecret, redirectUri } = authConfig.oidc;
    if (!issuer || !clientId || !clientSecret) {
        throw new Error('Configuration OIDC incomplète (OIDC_ISSUER, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET).');
    }

    const discovered = await Issuer.discover(issuer);
    oidcClient = new discovered.Client({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uris: [redirectUri],
        response_types: ['code'],
    });

    return oidcClient;
}

async function getAuthorizationUrl() {
    const client = await getOidcClient();
    const state = generators.state();
    const nonce = generators.nonce();
    pendingStates.set(state, { nonce, createdAt: Date.now() });

    const url = client.authorizationUrl({
        scope: authConfig.oidc.scopes,
        state,
        nonce,
    });

    return { url, state };
}

async function handleOidcCallback(params) {
    const client = await getOidcClient();
    const stateData = pendingStates.get(params.state);
    if (!stateData) {
        throw new Error('State OIDC invalide ou expiré.');
    }
    pendingStates.delete(params.state);

    const tokenSet = await client.callback(authConfig.oidc.redirectUri, params, {
        state: params.state,
        nonce: stateData.nonce,
    });

    const userinfo = await client.userinfo(tokenSet.access_token);
    const groups = userinfo.groups || userinfo.roles || [];

    const mfaVerified = Boolean(
        userinfo.amr?.includes('mfa') ||
        userinfo.acr === 'mfa' ||
        tokenSet.claims()?.amr?.includes('mfa')
    );

    return {
        email: userinfo.email || userinfo.preferred_username,
        displayName: userinfo.name || userinfo.email,
        groups: Array.isArray(groups) ? groups : [groups].filter(Boolean),
        mfaVerified,
    };
}

module.exports = { getAuthorizationUrl, handleOidcCallback };
