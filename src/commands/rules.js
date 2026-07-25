const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rules')
        .setDescription('Post the beautiful Nexora Server Rules.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), // Admin/Mod only
    async execute(interaction) {
        const color = '#8B5CF6'; // Nexora purple branding
        const thumbnail = interaction.guild.iconURL({ dynamic: true, size: 256 }) || null;

        const embed = new EmbedBuilder()
            .setColor(color)
            .setThumbnail(thumbnail)
            .setTitle('🌌 Welcome to Nexora 🌌')
            .setDescription(`> **Welcome to the official Nexora community!**\n> We're glad you're here. Please take a moment to read and follow these rules to help keep our server friendly, safe, and enjoyable for everyone.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n**📜 Server Rules**\n\n**🤝 1. Respect Everyone**\n• Treat all members with kindness and respect.\n• No harassment, bullying, discrimination, hate speech, or personal attacks.\n• Respect different opinions and backgrounds.\n\n**💬 2. Keep Chats Friendly**\n• Stay on topic in the appropriate channels.\n• Avoid unnecessary drama or arguments.\n• Be welcoming to new members.\n\n**🚫 3. No Spam**\n• No message spam.\n• No emoji spam.\n• No excessive CAPS.\n• No mass mentions (@everyone / @here).\n• No repeated messages.\n\n**📢 4. Advertising**\n• No server advertisements.\n• No self-promotion without permission.\n• No unsolicited DMs or invite links.\n\n**🛡️ 5. Keep It Safe**\n• No NSFW content.\n• No gore or disturbing content.\n• No scams, phishing, malware, or malicious links.\n• No impersonating staff, bots, or other members.\n\n**🤖 6. Bot Usage**\n• Use bot commands in the correct channels.\n• Don't abuse or exploit any bot features.\n• Report bugs instead of abusing them.\n\n**🎮 7. Community**\n• Help keep the community positive.\n• Respect voice chats.\n• Avoid trolling or intentionally ruining others' experience.\n\n**⚖️ 8. Follow Discord's Rules**\nAll members must follow Discord's **Terms of Service** and **Community Guidelines**.\n\n**👑 9. Staff Decisions**\n• Respect moderators and administrators.\n• If you disagree with a decision, create a support ticket instead of arguing publicly.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n**⚠️ Punishments**\n\n🟡 Warning  \n🟠 Timeout  \n🔴 Kick  \n⛔ Permanent Ban\n\nPunishments depend on the severity and frequency of the rule violation.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n**💜 Thank You**\n\nBy remaining in **Nexora**, you agree to follow these rules and help create a welcoming community for everyone.\n\n> ✨ **Respect • Community • Fun • Safety** ✨\n\n**Welcome to Nexora — where great communities are built together.** 🌌`)
            .setFooter({ text: 'Nexora • Community Rules', iconURL: thumbnail });

        await interaction.reply({ content: 'Rules posted successfully!', ephemeral: true });
        await interaction.channel.send({ embeds: [embed] });
    },
};
