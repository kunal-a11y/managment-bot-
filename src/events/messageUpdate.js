const { EmbedBuilder } = require('discord.js');
const { sendLog } = require('../utils/logger');

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage, client) {
        if (newMessage.author && newMessage.author.bot) return;
        if (oldMessage.content === newMessage.content) return; // Ignore embeds loading or pins

        const authorTag = newMessage.author ? newMessage.author.tag : 'Unknown User';
        const authorIcon = newMessage.author ? newMessage.author.displayAvatarURL() : null;

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Message Edited')
            .setDescription(`A message was edited in ${newMessage.channel}. [Jump to Message](${newMessage.url})`)
            .addFields(
                { name: 'Before', value: oldMessage.content || 'Unknown (Uncached)' },
                { name: 'After', value: newMessage.content || 'Unknown (Uncached)' }
            )
            .setTimestamp();

        if (authorIcon) {
            embed.setAuthor({ name: `Edited by: ${authorTag}`, iconURL: authorIcon });
        } else {
            embed.setAuthor({ name: `Edited by: ${authorTag}` });
        }

        await sendLog(newMessage.guild, embed);
    },
};
