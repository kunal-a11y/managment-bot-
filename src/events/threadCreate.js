const { enqueueLog } = require('../utils/logger');

module.exports = {
    name: 'threadCreate',
    async execute(thread, newlyCreated, client) {
        if (!thread.guild) return;
        enqueueLog(thread.guild.id, `🧵 **Thread Created:** ${thread} (\`${thread.name}\`) in <#${thread.parentId}>`);
    },
};
