const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rules')
        .setDescription('Post the beautiful Nexora Server Rules.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), // Admin/Mod only
    async execute(interaction) {
        const color = '#8B5CF6'; // Nexora purple branding
        const thumbnail = interaction.guild.iconURL({ dynamic: true, size: 256 }) || null;

        const embed1 = new EmbedBuilder()
            .setColor(color)
            .setTitle('📜 Server Rules')
            .setDescription('Welcome to **Nexora**! Please follow these rules to keep our community friendly and enjoyable.')
            .setThumbnail(thumbnail)
            .addFields(
                { name: '🤝 Respect Everyone', value: 'Be respectful. No harassment, hate speech, or discrimination.', inline: false },
                { name: '💬 Keep Chats Friendly', value: 'Stay on topic. No drama or toxicity.', inline: false },
                { name: '🚫 No Spam', value: 'No spam, excessive mentions, or message flooding.', inline: false },
                { name: '📢 No Advertising', value: 'No server invites, self-promotion, or unsolicited DMs.', inline: false }
            );

        const embed2 = new EmbedBuilder()
            .setColor(color)
            .setTitle('🛡️ Safety & Guidelines')
            .addFields(
                { name: '🛡️ Stay Safe', value: 'No NSFW, scams, phishing, or malicious content.', inline: false },
                { name: '🤖 Use Bots Properly', value: 'Use bot commands in the correct channels.', inline: false },
                { name: '⚖️ Follow Discord ToS', value: "Follow Discord's Terms of Service and Community Guidelines.", inline: false },
                { name: '👑 Respect Staff', value: 'Listen to staff. Use tickets if you have an issue.', inline: false }
            );

        const embed3 = new EmbedBuilder()
            .setColor(color)
            .setTitle('⚠️ Punishments')
            .setDescription('🟡 **Warning** → 🟠 **Timeout** → 🔴 **Kick** → ⛔ **Ban**')
            .addFields(
                { name: '💜 Agreement', value: 'By staying in Nexora, you agree to follow these rules.\nThanks for being part of our community!', inline: false }
            )
            .setFooter({ text: 'Nexora • Community Rules', iconURL: thumbnail });

        await interaction.reply({ content: 'Rules posted successfully!', ephemeral: true });
        await interaction.channel.send({ embeds: [embed1, embed2, embed3] });
    },
};
