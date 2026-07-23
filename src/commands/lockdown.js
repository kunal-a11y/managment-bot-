const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lockdown')
        .setDescription('Lockdown the entire server (prevents @everyone from sending messages and joining VC).')
        .addBooleanOption(option =>
            option.setName('enable')
                .setDescription('True to enable lockdown, False to lift it.')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const enable = interaction.options.getBoolean('enable');
        const guild = interaction.guild;

        await interaction.deferReply();

        let successCount = 0;

        for (const [channelId, channel] of guild.channels.cache) {
            try {
                if (channel.type === ChannelType.GuildText) {
                    await channel.permissionOverwrites.edit(guild.roles.everyone, {
                        SendMessages: enable ? false : null
                    });
                    successCount++;
                } else if (channel.type === ChannelType.GuildVoice) {
                    await channel.permissionOverwrites.edit(guild.roles.everyone, {
                        Connect: enable ? false : null
                    });
                    successCount++;
                }
            } catch (err) {
                console.error(`Failed to lock/unlock channel ${channel.name}:`, err);
            }
        }

        if (enable) {
            await interaction.followUp(`🔒 Server is now in **LOCKDOWN**. Restricted permissions in ${successCount} channels.`);
        } else {
            await interaction.followUp(`🔓 Server lockdown **LIFTED**. Restored permissions in ${successCount} channels.`);
        }
    },
};
