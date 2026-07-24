const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const cron = require('node-cron');
const db = require('../database/db');
const { fetchWithRetry } = require('../utils/api');

const RAWG_API_KEY = process.env.RAWG_API_KEY;

const GAME_CATEGORIES = [
    { name: 'Highly Rated', ordering: '-metacritic' },
    { name: 'Hidden Gems', ordering: '-rating', tags: 'indie', metacritic: '80,100' },
    { name: 'Multiplayer Hits', tags: 'multiplayer', ordering: '-added' },
    { name: 'Recent Releases', ordering: '-released', dates: `${new Date(Date.now() - 31536000000).toISOString().split('T')[0]},${new Date().toISOString().split('T')[0]}` },
    { name: 'Action AAA', genres: 'action', tags: 'singleplayer', metacritic: '85,100' }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setupgames')
        .setDescription('Setup an auto-poster for highly rated game recommendations every 5 minutes.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send game recommendations to')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        if (!RAWG_API_KEY) {
            return interaction.editReply({ content: '❌ The RAWG_API_KEY is missing in your .env file! Please add it first.' });
        }

        const channel = interaction.options.getChannel('channel');
        const guildId = interaction.guild.id;

        if (interaction.client.gamesIntervals.has(guildId)) {
            const existingTask = interaction.client.gamesIntervals.get(guildId);
            existingTask.stop();
        }

        // Send a game immediately for demonstration
        await sendRealGameSuggestion(channel, guildId);

        // Schedule to run every 5 minutes
        const task = cron.schedule('*/5 * * * *', async () => {
            await sendRealGameSuggestion(channel, guildId);
        });

        interaction.client.gamesIntervals.set(guildId, task);

        await interaction.editReply({ content: `✅ Successfully set up premium game recommendations every 5 minutes in ${channel}!` });
    },
};

async function sendRealGameSuggestion(channel, guildId) {
    if (!RAWG_API_KEY) return;
    
    try {
        const category = GAME_CATEGORIES[Math.floor(Math.random() * GAME_CATEGORIES.length)];
        
        let params = {
            key: RAWG_API_KEY,
            page_size: 40,
            page: Math.floor(Math.random() * 5) + 1,
            ordering: category.ordering
        };
        if (category.tags) params.tags = category.tags;
        if (category.genres) params.genres = category.genres;
        if (category.dates) params.dates = category.dates;
        if (category.metacritic) params.metacritic = category.metacritic;

        let data;
        try {
            data = await fetchWithRetry('https://api.rawg.io/api/games', { params });
        } catch (err) {
            if (err.response && err.response.status === 404) {
                // If page out of bounds, fallback to page 1
                params.page = 1;
                data = await fetchWithRetry('https://api.rawg.io/api/games', { params });
            } else {
                throw err;
            }
        }
        
        const games = data.results;
        if (!games || games.length === 0) return;

        // Fetch history
        const getHistory = db.prepare('SELECT game_id FROM games_history WHERE guild_id = ?').all(guildId);
        const historySet = new Set(getHistory.map(r => r.game_id));

        // If history is huge (> 10000), reset it to prevent memory/performance issues
        if (historySet.size > 10000) {
            db.prepare('DELETE FROM games_history WHERE guild_id = ?').run(guildId);
            historySet.clear();
        }

        let selectedGame = null;
        // Shuffle array to pick a random unseen game
        games.sort(() => Math.random() - 0.5);
        for (const game of games) {
            if (!historySet.has(game.id.toString())) {
                selectedGame = game;
                break;
            }
        }

        // If all 40 games on this page are in history, just skip this interval.
        if (!selectedGame) return;

        // Save to history
        db.prepare('INSERT INTO games_history (guild_id, game_id) VALUES (?, ?)').run(guildId, selectedGame.id.toString());

        // Fetch deep details for the selected game
        const gameDetails = await fetchWithRetry(`https://api.rawg.io/api/games/${selectedGame.id}`, { params: { key: RAWG_API_KEY } });

        const embed = new EmbedBuilder()
            .setColor('#AC00FF') // Purple color
            .setTitle(gameDetails.name)
            .setURL(`https://rawg.io/games/${gameDetails.slug}`)
            .setAuthor({ name: `🎮 ${category.name} Recommendation` })
            .setDescription(gameDetails.description_raw ? gameDetails.description_raw.substring(0, 1000) + '...' : 'No description available.')
            .setImage(gameDetails.background_image)
            .addFields(
                { name: 'Release Date', value: gameDetails.released || 'Unknown', inline: true },
                { name: 'Metacritic', value: gameDetails.metacritic ? gameDetails.metacritic.toString() : 'N/A', inline: true },
                { name: 'Genres', value: gameDetails.genres ? gameDetails.genres.map(g => g.name).join(', ') : 'None', inline: true }
            )
            .setTimestamp();
            
        if (gameDetails.developers && gameDetails.developers.length > 0) {
            embed.addFields({ name: 'Developer', value: gameDetails.developers[0].name, inline: true });
        }
        if (gameDetails.platforms && gameDetails.platforms.length > 0) {
            embed.addFields({ name: 'Platforms', value: gameDetails.platforms.map(p => p.platform.name).slice(0, 5).join(', '), inline: true });
        }

        const row = new ActionRowBuilder();
        
        // Find Steam Link if available
        let steamLink = null;
        if (gameDetails.stores) {
            const steamStore = gameDetails.stores.find(s => s.store.id === 1 || s.store.slug === 'steam');
            if (steamStore && steamStore.url) steamLink = steamStore.url;
        }

        if (steamLink) {
            row.addComponents(
                new ButtonBuilder()
                    .setLabel('View on Steam')
                    .setURL(steamLink)
                    .setStyle(ButtonStyle.Link)
            );
        }
        
        row.addComponents(
            new ButtonBuilder()
                .setLabel('More Info (RAWG)')
                .setURL(`https://rawg.io/games/${gameDetails.slug}`)
                .setStyle(ButtonStyle.Link)
        );

        await channel.send({ embeds: [embed], components: [row] });

    } catch (error) {
        console.error(`Error fetching game recommendation for channel ${channel.id}:`, error.message);
    }
}
