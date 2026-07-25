const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { isAuthorized } = require('../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Send a custom message through the bot to a specific channel.')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to send')
                .setRequired(true)
                .setMaxLength(2000))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send the message to')
                .setRequired(false)),
    async execute(interaction) {
        if (!isAuthorized(interaction.member)) {
            return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        
        const rawMessage = interaction.options.getString('message');
        // Manually truncate to 2000 chars just in case the Discord UI allows longer inputs
        const message = rawMessage.length > 2000 ? rawMessage.substring(0, 2000) : rawMessage;
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        try {
            await channel.send({ content: message });
            await interaction.editReply({ content: `Message sent successfully to ${channel}.` });
        } catch (error) {
            console.error('Error sending message in say command:', error.message);
            await interaction.editReply({ content: 'Failed to send the message. Make sure I have permissions in that channel.' });
        }
    },
};
