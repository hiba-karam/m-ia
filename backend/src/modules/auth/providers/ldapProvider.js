const ldap = require('ldapjs');
const authConfig = require('../../../config/authConfig');
const { resolveRoleFromGroups, upsertSsoUser } = require('../authService');

function createLdapClient() {
    const { url, bindDn, bindPassword } = authConfig.ldap;
    if (!url) throw new Error('LDAP_URL non configuré.');

    const client = ldap.createClient({ url, reconnect: true, timeout: 10000 });
    return new Promise((resolve, reject) => {
        if (bindDn && bindPassword) {
            client.bind(bindDn, bindPassword, (err) => {
                if (err) reject(err);
                else resolve(client);
            });
        } else {
            resolve(client);
        }
    });
}

function ldapSearch(client, base, options) {
    return new Promise((resolve, reject) => {
        const entries = [];
        client.search(base, options, (err, res) => {
            if (err) return reject(err);
            res.on('searchEntry', (entry) => entries.push(entry.object));
            res.on('error', reject);
            res.on('end', () => resolve(entries));
        });
    });
}

async function authenticateLdap(username, password) {
    const { baseDn, userSearchBase, userSearchFilter, groupMemberAttribute } = authConfig.ldap;
    const client = await createLdapClient();

    try {
        const filter = userSearchFilter.replace('{{username}}', username);
        const users = await ldapSearch(client, userSearchBase || baseDn, {
            scope: 'sub',
            filter,
            attributes: ['dn', 'mail', 'displayName', 'userPrincipalName', groupMemberAttribute],
        });

        if (!users.length) {
            throw new Error('Utilisateur LDAP introuvable.');
        }

        const entry = users[0];
        const userDn = entry.dn;
        const email = entry.mail || entry.userPrincipalName;
        if (!email) throw new Error('Email LDAP manquant pour cet utilisateur.');

        await new Promise((resolve, reject) => {
            client.bind(userDn, password, (err) => (err ? reject(err) : resolve()));
        });

        const groups = entry[groupMemberAttribute] || [];
        const groupList = Array.isArray(groups) ? groups : [groups].filter(Boolean);
        const role = await resolveRoleFromGroups('ldap', groupList);

        const user = await upsertSsoUser({
            email,
            displayName: entry.displayName || username,
            authSource: 'ldap',
            roleId: role.id,
            mfaVerified: false,
        });

        return user;
    } finally {
        client.unbind(() => {});
    }
}

module.exports = { authenticateLdap };
