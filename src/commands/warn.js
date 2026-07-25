const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../database/db');
const { isAuthorized } = require('../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Issues a warning to a member.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The member to warn')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('The reason for warning')
                .setRequired(true)),
    async execute(interaction) {
        if (!isAuthorized(interaction.member)) {
            return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
        }

        const targetUser = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason');

        // Save warning to DB
        try {
            db.prepare(`
                INSERT INTO warnings (guild_id, user_id, moderator_id, reason)
                VALUES (?, ?, ?, ?)
            `).run(interaction.guild.id, targetUser.id, interaction.user.id, reason);
        } catch (error) {
            console.error('Database error in warn command:', error);
            return interaction.reply({ content: '❌ Failed to save warning to database.', ephemeral: true });
        }

        const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
        if (member) {
            await member.send(`You have received a warning in **${interaction.guild.name}**.\nReason: ${reason}`).catch(() => {});
        }

        const embed = new EmbedBuilder()
            .setColor('#FFFF00')
            .setTitle('⚠️ Member Warned')
            .setDescription(`**${targetUser.tag}** has been warned.`)
            .addFields({ name: 'Reason', value: reason });
            
        await interaction.reply({ embeds: [embed] });
    },
};
