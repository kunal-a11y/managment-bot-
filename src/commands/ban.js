const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { isAuthorized } = require('../utils/permissions');
const { logIncident } = require('../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a member from the server.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The member to ban')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('The reason for banning')
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
        if (!member.bannable) {
            return interaction.reply({ content: '❌ I cannot ban this user. Their role might be higher than mine.', ephemeral: true });
        }

        try {
            await member.send(`You have been banned from **${interaction.guild.name}**.\nReason: ${reason}`).catch(() => {});
            await member.ban({ reason: `Banned by ${interaction.user.tag} | ${reason}` });
            
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🔨 Member Banned')
                .setDescription(`**${targetUser.tag}** has been banned.`)
                .addFields(
                    { name: 'Reason', value: reason },
                    { name: 'Moderator', value: interaction.user.tag }
                )
                .setTimestamp();
                
            await interaction.reply({ embeds: [embed] });
            await logIncident(interaction.guild, embed);
        } catch (error) {
            console.error('Ban error:', error);
            await interaction.reply({ content: '❌ An error occurred while trying to ban the user.', ephemeral: true });
        }
    },
};
