const { enqueueLog } = require('../utils/logger');

module.exports = {
    name: 'threadDelete',
    async execute(thread, client) {
        if (!thread.guild) return;
        enqueueLog(thread.guild.id, `🧵 **Thread Deleted:** \`${thread.name}\` from <#${thread.parentId}>`);
    },
};
