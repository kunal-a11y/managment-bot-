const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { isAuthorized } = require('../utils/permissions');
const { logIncident } = require('../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Times out a member for a specific duration.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The member to timeout')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('duration')
                .setDescription('Duration in minutes')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('The reason for the timeout')
                .setRequired(false)),
    async execute(interaction) {
        if (!isAuthorized(interaction.member)) {
            return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
        }

        const targetUser = interaction.options.getUser('target');
        const durationMin = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        if (!member) {
            return interaction.reply({ content: '❌ That user is not in the server.', ephemeral: true });
        }
        if (!member.moderatable) {
            return interaction.reply({ content: '❌ I cannot timeout this user. Their role might be higher than mine.', ephemeral: true });
        }

        try {
            const msDuration = durationMin * 60 * 1000;
            await member.send(`You have been timed out in **${interaction.guild.name}** for ${durationMin} minutes.\nReason: ${reason}`).catch(() => {});
            await member.timeout(msDuration, `Timed out by ${interaction.user.tag} | ${reason}`);
            
            const embed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('⏳ Member Timed Out')
                .setDescription(`**${targetUser.tag}** has been timed out for ${durationMin} minutes.`)
                .addFields(
                    { name: 'Reason', value: reason },
                    { name: 'Moderator', value: interaction.user.tag }
                )
                .setTimestamp();
                
            await interaction.reply({ embeds: [embed] });
            await logIncident(interaction.guild, embed);
        } catch (error) {
            console.error('Timeout error:', error);
            await interaction.reply({ content: '❌ An error occurred while trying to timeout the user.', ephemeral: true });
        }
    },
};
