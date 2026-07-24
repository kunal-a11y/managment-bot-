const { enqueueLog } = require('../utils/logger');

module.exports = {
    name: 'threadUpdate',
    async execute(oldThread, newThread, client) {
        if (!newThread.guild) return;
        
        if (oldThread.archived !== newThread.archived) {
            enqueueLog(newThread.guild.id, `🧵 **Thread ${newThread.archived ? 'Archived' : 'Unarchived'}:** ${newThread} (\`${newThread.name}\`)`);
        }
    },
};
