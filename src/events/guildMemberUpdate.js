const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const { sendLog } = require('../utils/logger');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember, client) {
        const guild = newMember.guild;

        // --- 1. TIMEOUT (MUTE/UNMUTE) TRACKING ---
        if (oldMember.communicationDisabledUntilTimestamp !== newMember.communicationDisabledUntilTimestamp) {
            const embed = new EmbedBuilder()
                .setThumbnail(newMember.user.displayAvatarURL())
                .setTimestamp();

            // Timeout Added
            if (newMember.communicationDisabledUntilTimestamp && newMember.communicationDisabledUntilTimestamp > Date.now()) {
                const until = new Date(newMember.communicationDisabledUntilTimestamp);
                
                embed.setColor('#FFA500') // Orange for timeout
                     .setTitle('Member Timed Out (Muted)')
                     .setDescription(`**${newMember.user.tag}** has been timed out until ${until.toLocaleString()}.`);

                try {
                    // Fetch audit log to find executor
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    const fetchedLogs = await guild.fetchAuditLogs({
                        limit: 1,
                        type: AuditLogEvent.MemberUpdate,
                    });
                    const timeoutLog = fetchedLogs.entries.first();
                    
                    if (timeoutLog && timeoutLog.target.id === newMember.id && (Date.now() - timeoutLog.createdTimestamp < 5000)) {
                        embed.addFields(
                            { name: 'Executor', value: timeoutLog.executor.tag, inline: true },
                            { name: 'Reason', value: timeoutLog.reason || 'No reason provided', inline: true }
                        );
                    }
                } catch (err) {
                    console.error('Failed to fetch timeout audit log:', err);
                }
            } 
            // Timeout Removed
            else if (!newMember.communicationDisabledUntilTimestamp || newMember.communicationDisabledUntilTimestamp < Date.now()) {
                embed.setColor('#00FF00') // Green for unmute
                     .setTitle('Member Timeout Removed')
                     .setDescription(`**${newMember.user.tag}**'s timeout has been removed.`);
                     
                try {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    const fetchedLogs = await guild.fetchAuditLogs({
                        limit: 1,
                        type: AuditLogEvent.MemberUpdate,
                    });
                    const timeoutLog = fetchedLogs.entries.first();
                    
                    if (timeoutLog && timeoutLog.target.id === newMember.id && (Date.now() - timeoutLog.createdTimestamp < 5000)) {
                        embed.addFields(
                            { name: 'Executor', value: timeoutLog.executor.tag, inline: true }
                        );
                    }
                } catch (err) {
                    console.error('Failed to fetch unmute audit log:', err);
                }
            }
            
            await sendLog(guild, embed);
        }

        // --- 2. ROLE CHANGES TRACKING ---
        if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
            const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
            const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

            if (addedRoles.size > 0 || removedRoles.size > 0) {
                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('Member Roles Updated')
                    .setAuthor({ name: newMember.user.tag, iconURL: newMember.user.displayAvatarURL() })
                    .setTimestamp();

                let desc = `Roles for **${newMember.user.tag}** were updated.\n\n`;
                if (addedRoles.size > 0) desc += `**Added:** ${addedRoles.map(r => r.name).join(', ')}\n`;
                if (removedRoles.size > 0) desc += `**Removed:** ${removedRoles.map(r => r.name).join(', ')}\n`;
                
                embed.setDescription(desc);

                try {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    const fetchedLogs = await guild.fetchAuditLogs({
                        limit: 1,
                        type: AuditLogEvent.MemberRoleUpdate,
                    });
                    
                    const roleLog = fetchedLogs.entries.first();
                    if (roleLog && roleLog.target.id === newMember.id && (Date.now() - roleLog.createdTimestamp < 5000)) {
                        embed.addFields({ name: 'Updated By', value: roleLog.executor.tag });
                    }
                } catch (err) {
                    console.error('Failed to fetch role update audit log:', err);
                }

                await sendLog(guild, embed);
            }
        }
    },
};
