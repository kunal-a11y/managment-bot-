const { EmbedBuilder } = require('discord.js');
const { sendLog } = require('../utils/logger');

module.exports = {
    name: 'channelCreate',
    async execute(channel, client) {
        if (!channel.guild) return; // Ignore DM channels

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Channel Created')
            .setDescription(`A new channel was created: ${channel} (\`${channel.name}\`)`)
            .addFields({ name: 'Channel Type', value: channel.type.toString() })
            .setTimestamp();

        await sendLog(channel.guild, embed);
    },
};
