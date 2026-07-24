const { AuditLogEvent } = require('discord.js');
const { enqueueLog } = require('../utils/logger');

module.exports = {
    name: 'messageDelete',
    async execute(message, client) {
        if (message.author && message.author.bot) return;

        await new Promise(resolve => setTimeout(resolve, 1000));

        let authorTag = message.author ? message.author.tag : null;
        let executorTag = null;

        try {
            const fetchedLogs = await message.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.MessageDelete,
            });

            const deletionLog = fetchedLogs.entries.first();

            if (deletionLog && Date.now() - deletionLog.createdTimestamp < 5000) {
                const { executor, target } = deletionLog;
                executorTag = executor.tag;
                if (!authorTag && target) {
                    authorTag = target.tag;
                }
            }
        } catch (error) {
            console.error('Failed to fetch audit logs for messageDelete:', error);
        }

        const finalAuthorTag = authorTag || 'Unknown User';
        const contentStr = message.content ? `"${message.content.substring(0, 100)}${message.content.length > 100 ? '...' : ''}"` : 'Unknown/Media';

        if (executorTag) {
            enqueueLog(message.guild.id, `🗑️ **Message Deleted:** by ${finalAuthorTag} in ${message.channel}. (Deleted by ${executorTag})\nContent: ${contentStr}`);
        } else {
            enqueueLog(message.guild.id, `🗑️ **Message Deleted:** by ${finalAuthorTag} in ${message.channel}.\nContent: ${contentStr}`);
        }
    },
};
