const { AuditLogEvent } = require('discord.js');
const { enqueueLog } = require('../utils/logger');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember, client) {
        const guild = newMember.guild;

        // --- 1. TIMEOUT (MUTE/UNMUTE) TRACKING ---
        if (oldMember.communicationDisabledUntilTimestamp !== newMember.communicationDisabledUntilTimestamp) {
            let executorTag = 'Unknown';
            let reason = 'No reason provided';
            
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                const fetchedLogs = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberUpdate });
                const timeoutLog = fetchedLogs.entries.first();
                if (timeoutLog && timeoutLog.target.id === newMember.id && (Date.now() - timeoutLog.createdTimestamp < 5000)) {
                    executorTag = timeoutLog.executor.tag;
                    reason = timeoutLog.reason || reason;
                }
            } catch (err) {
                console.error('Failed to fetch timeout audit log:', err);
            }

            if (newMember.communicationDisabledUntilTimestamp && newMember.communicationDisabledUntilTimestamp > Date.now()) {
                const until = new Date(newMember.communicationDisabledUntilTimestamp);
                enqueueLog(guild.id, `🔇 **Timeout Added:** ${newMember.user.tag} until ${until.toLocaleString()}. (Executor: ${executorTag}, Reason: ${reason})`);
            } else {
                enqueueLog(guild.id, `🔊 **Timeout Removed:** ${newMember.user.tag}. (Executor: ${executorTag})`);
            }
        }

        // --- 2. ROLE CHANGES TRACKING ---
        if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
            const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
            const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

            if (addedRoles.size > 0 || removedRoles.size > 0) {
                let executorTag = 'Unknown';
                try {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    const fetchedLogs = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberRoleUpdate });
                    const roleLog = fetchedLogs.entries.first();
                    if (roleLog && roleLog.target.id === newMember.id && (Date.now() - roleLog.createdTimestamp < 5000)) {
                        executorTag = roleLog.executor.tag;
                    }
                } catch (err) {
                    console.error('Failed to fetch role update audit log:', err);
                }

                let desc = `🎭 **Roles Updated:** for ${newMember.user.tag} (Executor: ${executorTag})`;
                if (addedRoles.size > 0) desc += `\n**Added:** ${addedRoles.map(r => r.name).join(', ')}`;
                if (removedRoles.size > 0) desc += `\n**Removed:** ${removedRoles.map(r => r.name).join(', ')}`;
                
                enqueueLog(guild.id, desc);
            }
        }
    },
};
