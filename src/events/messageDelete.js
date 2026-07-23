const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const { sendLog } = require('../utils/logger');

module.exports = {
    name: 'messageDelete',
    async execute(message, client) {
        if (message.author && message.author.bot) return;

        // Delay a tiny bit to ensure audit logs update BEFORE we process
        await new Promise(resolve => setTimeout(resolve, 1000));

        let authorTag = message.author ? message.author.tag : null;
        let authorIcon = message.author ? message.author.displayAvatarURL() : null;
        let executorTag = null;

        try {
            // Fetch audit logs to see who deleted it AND whose message was deleted
            const fetchedLogs = await message.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.MessageDelete,
            });

            const deletionLog = fetchedLogs.entries.first();

            if (deletionLog && Date.now() - deletionLog.createdTimestamp < 5000) {
                const { executor, target } = deletionLog;
                executorTag = executor.tag;
                
                // If message was uncached, we can grab the author from the audit log 'target'
                if (!authorTag && target) {
                    authorTag = target.tag;
                    authorIcon = target.displayAvatarURL();
                }
            }
        } catch (error) {
            console.error('Failed to fetch audit logs for messageDelete:', error);
        }

        const finalAuthorTag = authorTag || 'Unknown User (Too old)';

        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('Message Deleted')
            .addFields({ name: 'Content', value: message.content || 'Unknown (Message was sent before the bot was turned on, or was just an image)' })
            .setTimestamp();

        if (authorIcon) {
            embed.setAuthor({ name: `Sent by: ${finalAuthorTag}`, iconURL: authorIcon });
        } else {
            embed.setAuthor({ name: `Sent by: ${finalAuthorTag}` });
        }

        if (executorTag) {
            embed.setDescription(`A message was deleted in ${message.channel}.\n\n**Deleted by:** ${executorTag}`);
        } else {
            embed.setDescription(`A message was deleted in ${message.channel}.\n\n*Executor unknown (likely deleted by the author themselves).*`);
        }

        await sendLog(message.guild, embed);
    },
};
