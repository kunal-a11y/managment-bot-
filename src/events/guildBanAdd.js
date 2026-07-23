const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const { sendLog } = require('../utils/logger');

module.exports = {
    name: 'guildBanAdd',
    async execute(ban, client) {
        const guild = ban.guild;
        const user = ban.user;
        
        const embed = new EmbedBuilder()
            .setColor('#FF0000') // Dark red for ban
            .setTitle('Member Banned')
            .setDescription(`${user.tag} was banned from the server.`)
            .setThumbnail(user.displayAvatarURL())
            .setTimestamp();

        // Check audit logs to see who banned
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const fetchedLogs = await guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.MemberBanAdd,
            });
            
            const banLog = fetchedLogs.entries.first();
            if (banLog) {
                const { executor, target, createdTimestamp, reason } = banLog;
                
                // Check if the log is recent and matches the user
                if (target.id === user.id && Date.now() - createdTimestamp < 5000) {
                    embed.addFields(
                        { name: 'Executor', value: `${executor.tag}` },
                        { name: 'Reason', value: reason || 'No reason provided' }
                    );
                }
            }
        } catch (error) {
            console.error('Could not fetch audit logs for ban:', error);
        }

        await sendLog(guild, embed);
    },
};
