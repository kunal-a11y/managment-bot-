const { enqueueLog } = require('../utils/logger');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member, client) {
        const guild = member.guild;
        let isKick = false;
        let executorTag = null;
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const fetchedLogs = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberKick });
            const kickLog = fetchedLogs.entries.first();
            if (kickLog) {
                const { executor, target, createdTimestamp } = kickLog;
                if (target.id === member.id && Date.now() - createdTimestamp < 5000) {
                    isKick = true;
                    executorTag = executor.tag;
                }
            }
        } catch (error) {
            console.error('Could not fetch audit logs for kick:', error);
        }

        if (isKick) {
            enqueueLog(guild.id, `👢 **Member Kicked:** ${member.user.tag} (Executor: ${executorTag})`);
        } else if (member.user.bot) {
            enqueueLog(guild.id, `🤖 **Bot Removed:** ${member.user.tag}`);
        } else {
            enqueueLog(guild.id, `👋 **Member Left:** ${member.user.tag} (${member.id})`);
        }
    },
};
