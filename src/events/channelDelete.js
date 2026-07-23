const { EmbedBuilder } = require('discord.js');
const { sendLog } = require('../utils/logger');

module.exports = {
    name: 'channelDelete',
    async execute(channel, client) {
        if (!channel.guild) return; // Ignore DM channels

        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('Channel Deleted')
            .setDescription(`A channel was deleted: \`${channel.name}\``)
            .addFields({ name: 'Channel Type', value: channel.type.toString() })
            .setTimestamp();

        await sendLog(channel.guild, embed);
    },
};
