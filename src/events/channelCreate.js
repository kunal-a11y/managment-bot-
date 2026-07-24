const { enqueueLog } = require('../utils/logger');

module.exports = {
    name: 'channelCreate',
    async execute(channel, client) {
        if (!channel.guild) return; // Ignore DM channels

        enqueueLog(channel.guild.id, `**Channel Created:** ${channel} (\`${channel.name}\`) [Type: ${channel.type}]`);
    },
};
