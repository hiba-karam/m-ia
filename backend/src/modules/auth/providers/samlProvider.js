const { SAML } = require('@node-saml/node-saml');
const authConfig = require('../../../config/authConfig');

function createSamlInstance() {
    const { entryPoint, issuer, callbackUrl, cert, groupAttribute } = authConfig.saml;
    if (!entryPoint || !cert) {
        throw new Error('Configuration SAML incomplète (SAML_ENTRY_POINT, SAML_IDP_CERT).');
    }

    return new SAML({
        entryPoint,
        issuer,
        callbackUrl,
        idpCert: cert,
        wantAssertionsSigned: true,
    });
}

async function getSamlLoginUrl() {
    const saml = createSamlInstance();
    return saml.getAuthorizeUrlAsync('', {}, {});
}

async function handleSamlCallback(body) {
    const saml = createSamlInstance();
    const { profile } = await saml.validatePostResponseAsync(body);

    const email = profile.email || profile.nameID;
    const groups = profile[groupAttribute] || profile.groups || [];
    const groupList = Array.isArray(groups) ? groups : [groups].filter(Boolean);

    return {
        email,
        displayName: profile.displayName || profile.cn || email,
        groups: groupList,
        mfaVerified: profile.authnContextClassRef?.includes('MultiFactor') || false,
    };
}

module.exports = { getSamlLoginUrl, handleSamlCallback };
