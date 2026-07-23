const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const { sendLog } = require('../utils/logger');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member, client) {
        const guild = member.guild;
        
        const embed = new EmbedBuilder()
            .setColor('#FFA500') // Orange for leave
            .setTitle('Member Left / Removed')
            .setDescription(`${member.user.tag} has left the server.`)
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp();

        // Check audit logs to see if it was a kick
        try {
            // Delay slightly to ensure Discord has written the audit log
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const fetchedLogs = await guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.MemberKick,
            });
            
            const kickLog = fetchedLogs.entries.first();
            if (kickLog) {
                const { executor, target, createdTimestamp } = kickLog;
                
                // Check if the log is recent and matches the user
                if (target.id === member.id && Date.now() - createdTimestamp < 5000) {
                    embed.setColor('#FF0000'); // Red for kick
                    embed.setTitle('Member Kicked');
                    embed.setDescription(`${member.user.tag} was kicked from the server.`);
                    embed.addFields({ name: 'Executor', value: `${executor.tag}` });
                }
            }
        } catch (error) {
            console.error('Could not fetch audit logs for kick:', error);
        }

        if (member.user.bot) {
            embed.setTitle('Bot Removed');
            embed.setDescription(`Bot ${member.user.tag} was removed from the server.`);
        }

        await sendLog(guild, embed);
    },
};
