const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

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
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        
        const message = interaction.options.getString('message');
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        try {
            await channel.send(message);
            await interaction.editReply({ content: `Message sent successfully to ${channel}.` });
        } catch (error) {
            console.error('Error sending message in say command:', error.message);
            await interaction.editReply({ content: 'Failed to send the message. Make sure I have permissions in that channel.' });
        }
    },
};
