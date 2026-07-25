const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { isAuthorized } = require('../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a member from the server.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The member to kick')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('The reason for kicking')
                .setRequired(false)),
    async execute(interaction) {
        if (!isAuthorized(interaction.member)) {
            return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
        }

        const targetUser = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        if (!member) {
            return interaction.reply({ content: '❌ That user is not in the server.', ephemeral: true });
        }
        if (!member.kickable) {
            return interaction.reply({ content: '❌ I cannot kick this user. Their role might be higher than mine.', ephemeral: true });
        }

        try {
            await member.send(`You have been kicked from **${interaction.guild.name}**.\nReason: ${reason}`).catch(() => {});
            await member.kick(`Kicked by ${interaction.user.tag} | ${reason}`);
            
            const embed = new EmbedBuilder()
                .setColor('#FF9900')
                .setTitle('👢 Member Kicked')
                .setDescription(`**${targetUser.tag}** has been kicked.`)
                .addFields({ name: 'Reason', value: reason });
                
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Kick error:', error);
            await interaction.reply({ content: '❌ An error occurred while trying to kick the user.', ephemeral: true });
        }
    },
};
