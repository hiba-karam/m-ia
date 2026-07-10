module.exports = {
    jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresInDays: parseInt(process.env.REFRESH_EXPIRES_DAYS || '7', 10),

    // Mode principal : oidc | saml | ldap | local
    authMode: (process.env.AUTH_MODE || 'local').toLowerCase(),

    localLoginEnabled: process.env.LOCAL_LOGIN_ENABLED !== 'false',

    oidc: {
        issuer: process.env.OIDC_ISSUER,
        clientId: process.env.OIDC_CLIENT_ID || process.env.SSO_CLIENT_ID,
        clientSecret: process.env.OIDC_CLIENT_SECRET || process.env.SSO_CLIENT_SECRET,
        redirectUri: process.env.OIDC_REDIRECT_URI || 'http://localhost:3000/api/auth/sso/callback',
        scopes: process.env.OIDC_SCOPES || 'openid profile email groups',
    },

    saml: {
        entryPoint: process.env.SAML_ENTRY_POINT,
        issuer: process.env.SAML_ISSUER || 'm-ia-sp',
        callbackUrl: process.env.SAML_CALLBACK_URL || 'http://localhost:3000/api/auth/saml/callback',
        cert: process.env.SAML_IDP_CERT,
        groupAttribute: process.env.SAML_GROUP_ATTRIBUTE || 'groups',
    },

    ldap: {
        url: process.env.LDAP_URL,
        baseDn: process.env.LDAP_BASE_DN,
        bindDn: process.env.LDAP_BIND_DN,
        bindPassword: process.env.LDAP_BIND_PASSWORD,
        userSearchBase: process.env.LDAP_USER_SEARCH_BASE,
        userSearchFilter: process.env.LDAP_USER_SEARCH_FILTER || '(sAMAccountName={{username}})',
        groupSearchBase: process.env.LDAP_GROUP_SEARCH_BASE,
        groupMemberAttribute: process.env.LDAP_GROUP_MEMBER_ATTRIBUTE || 'memberOf',
    },

    mfaRequiredForAdmin: process.env.MFA_REQUIRED_ADMIN !== 'false',
    defaultRoleName: process.env.DEFAULT_ROLE_NAME || 'Utilisateur',
};
