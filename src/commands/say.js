const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Send a custom message through the bot to a specific channel.')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to send')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send the message to')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), // Admin/Mod only
    async execute(interaction) {
        const message = interaction.options.getString('message');
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        try {
            await channel.send(message);
            await interaction.reply({ content: `Message sent successfully to ${channel}.`, ephemeral: true });
        } catch (error) {
            console.error('Error sending message:', error);
            await interaction.reply({ content: 'Failed to send the message. Make sure I have permissions in that channel.', ephemeral: true });
        }
    },
};
