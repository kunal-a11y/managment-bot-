const { enqueueLog } = require('../utils/logger');

module.exports = {
    name: 'channelDelete',
    async execute(channel, client) {
        if (!channel.guild) return; // Ignore DM channels

        enqueueLog(channel.guild.id, `**Channel Deleted:** \`${channel.name}\` [Type: ${channel.type}]`);
    },
};
