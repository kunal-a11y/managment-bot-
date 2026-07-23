const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const cron = require('node-cron');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setupgames')
        .setDescription('Setup an auto-poster for REAL free PC games.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send free games to')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const channel = interaction.options.getChannel('channel');
        const guildId = interaction.guild.id;

        if (interaction.client.gamesIntervals.has(guildId)) {
            const existingTask = interaction.client.gamesIntervals.get(guildId);
            existingTask.stop();
        }

        // Send a game immediately for demonstration
        await sendRealGameSuggestion(channel);

        // Schedule to run every 15 minutes: */15 * * * *
        const task = cron.schedule('*/15 * * * *', async () => {
            await sendRealGameSuggestion(channel);
        });

        interaction.client.gamesIntervals.set(guildId, task);

        await interaction.editReply({ content: `✅ Successfully set up REAL free game suggestions every 15 minutes in ${channel}! (A sample has been sent now)` });
    },
};

async function sendRealGameSuggestion(channel) {
    try {
        let retries = 3;
        let response;
        while (retries > 0) {
            try {
                response = await axios.get('https://www.freetogame.com/api/games', {
                    params: {
                        platform: 'pc',
                        sort_by: 'popularity'
                    },
                    timeout: 10000 // 10 second timeout
                });
                break;
            } catch (err) {
                retries--;
                if (retries === 0) throw err;
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retrying
            }
        }

        const games = response.data;
        if (!games || games.length === 0) return;

        // Pick a random game from the top 50 popular free games
        const randomGame = games[Math.floor(Math.random() * Math.min(50, games.length))];

        const embed = new EmbedBuilder()
            .setColor('#9B59B6') // Purple color
            .setTitle(randomGame.title)
            .setURL(randomGame.game_url)
            .setAuthor({ name: `🎮 Free on ${randomGame.platform}` })
            .setDescription(randomGame.short_description || 'No description available.')
            .setImage(randomGame.thumbnail)
            .addFields(
                { name: 'Genre', value: randomGame.genre, inline: true },
                { name: 'Publisher', value: randomGame.publisher, inline: true }
            )
            .setFooter({ text: 'Grab it while it\'s free!' })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Get It Now')
                    .setURL(randomGame.game_url)
                    .setStyle(ButtonStyle.Link)
            );

        await channel.send({ embeds: [embed], components: [row] });

    } catch (error) {
        console.error(`Error fetching real free game suggestion for channel ${channel.id}:`, error.message);
    }
}
