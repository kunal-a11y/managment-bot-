const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('View the comprehensive guide on how to use Nexora bots.'),
    async execute(interaction) {
        const color = '#8B5CF6'; 
        const thumbnail = interaction.guild.iconURL({ dynamic: true, size: 256 }) || null;

        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle('🌌 Nexora Bot Ecosystem Guide')
            .setDescription('Welcome to the Nexora Bot network! Here is how to use all of our core bots.')
            .setThumbnail(thumbnail)
            .addFields(
                { name: '🎵 Nexora Music Bot', value: 'High-quality music streaming.\n• `/play <song>`: Play a song.\n• `/stop`: Stop the music.\n• `/skip`: Skip current track.\n• `/queue`: View the queue.\n• `/favorites`: Manage saved tracks.', inline: false },
                { name: '🗣️ Nexora TTS Bot', value: 'Text-To-Speech for your voice channels.\n• `/tts-join`: Joins your VC and binds to the current text channel.\n• `/tts-leave`: Leaves the VC.\n• `/tts-language <code>`: Change voice language (e.g., `en`, `fr`).', inline: false },
                { name: '⚙️ Nexora Management Bot', value: 'Server utilities, logs, and moderation.\n• `/rules`: Post the server rules.\n• `/setupgames` & `/movies`: Auto-posters for content.\n• `/lockdown`: Lock a channel during raids.\n• Moderation: `/ban`, `/kick`, `/timeout`, `/warn`.', inline: false }
            )
            .setFooter({ text: 'Nexora Core Systems', iconURL: thumbnail });

        await interaction.reply({ embeds: [embed] });
    },
};
