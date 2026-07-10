const { ClientSecretCredential } = require('@azure/identity');
const { Client } = require('@microsoft/microsoft-graph-client');
const { TokenCredentialAuthenticationProvider } = require('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');
const emailConfig = require('../../../config/emailConfig');

function createGraphClient() {
    const { tenantId, clientId, clientSecret } = emailConfig.graph;
    if (!tenantId || !clientId || !clientSecret) {
        throw new Error('Configuration Graph API incomplète (AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET).');
    }

    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
        scopes: ['https://graph.microsoft.com/.default'],
    });

    return Client.initWithMiddleware({ authProvider });
}

async function fetchUnreadMessages() {
    const mailbox = emailConfig.mailbox || emailConfig.graph.userId;
    if (!mailbox) {
        throw new Error('MSUPPORT_MAILBOX ou MSUPPORT_GRAPH_USER_ID requis.');
    }

    const client = createGraphClient();
    const max = emailConfig.sync.maxMessagesPerRun;

    const response = await client
        .api(`/users/${mailbox}/mailFolders/inbox/messages`)
        .filter('isRead eq false')
        .top(max)
        .select('id,internetMessageId,subject,from,receivedDateTime,bodyPreview,hasAttachments')
        .orderby('receivedDateTime asc')
        .get();

    const messages = [];
    for (const item of response.value || []) {
        const attachments = [];
        if (item.hasAttachments) {
            const attResponse = await client
                .api(`/users/${mailbox}/messages/${item.id}/attachments`)
                .select('name,contentType,size')
                .get();

            for (const att of attResponse.value || []) {
                if (att['@odata.type'] === '#microsoft.graph.fileAttachment') {
                    attachments.push({
                        fileName: att.name,
                        contentType: att.contentType,
                        sizeBytes: att.size || 0,
                    });
                }
            }
        }

        messages.push({
            messageId: item.internetMessageId || item.id,
            fromEmail: item.from?.emailAddress?.address,
            fromName: item.from?.emailAddress?.name,
            subject: item.subject,
            bodyPreview: item.bodyPreview,
            bodyText: item.bodyPreview,
            receivedAt: new Date(item.receivedDateTime),
            attachments,
            graphId: item.id,
        });
    }

    return messages;
}

async function markAsProcessed(graphId) {
    const mailbox = emailConfig.mailbox || emailConfig.graph.userId;
    const client = createGraphClient();
    await client.api(`/users/${mailbox}/messages/${graphId}`).update({ isRead: true });
}

module.exports = { fetchUnreadMessages, markAsProcessed };
