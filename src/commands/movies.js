const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const cron = require('node-cron');
const db = require('../database/db');
const { fetchWithRetry } = require('../utils/api');

const TMDB_API_KEY = process.env.TMDB_API_KEY;

const THEMES = [
    { name: 'Action & Adventure', with_genres: '28,12', type: 'movie' },
    { name: 'Sci-Fi Marvels', with_genres: '878', type: 'movie' },
    { name: 'Comedy Gold', with_genres: '35', type: 'movie' },
    { name: 'Trending TV Shows', type: 'tv' },
    { name: 'Anime Series', with_genres: '16', with_original_language: 'ja', type: 'tv' },
    { name: 'Crime Drama', with_genres: '80,18', type: 'tv' }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('movies')
        .setDescription('Setup an auto-poster for premium movies and TV shows every 5 minutes.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send suggestions to')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        if (!TMDB_API_KEY) {
            return interaction.editReply({ content: '❌ The TMDB_API_KEY is missing in your .env file!' });
        }

        const channel = interaction.options.getChannel('channel');
        const guildId = interaction.guild.id;

        if (interaction.client.moviesIntervals.has(guildId)) {
            const existingTask = interaction.client.moviesIntervals.get(guildId);
            existingTask.stop();
        }

        // Send one immediately
        await sendRealMovieSuggestion(channel, guildId);

        // Schedule to run every 5 minutes
        const task = cron.schedule('*/5 * * * *', async () => {
            await sendRealMovieSuggestion(channel, guildId);
        });

        interaction.client.moviesIntervals.set(guildId, task);

        await interaction.editReply({ content: `✅ Successfully set up premium Movie/TV suggestions every 5 minutes in ${channel}!` });
    },
};

async function sendRealMovieSuggestion(channel, guildId) {
    if (!TMDB_API_KEY) return;
    
    try {
        const theme = THEMES[Math.floor(Math.random() * THEMES.length)];
        const isTV = theme.type === 'tv';
        const endpoint = isTV ? 'discover/tv' : 'discover/movie';
        
        let params = {
            api_key: TMDB_API_KEY,
            sort_by: 'popularity.desc',
            page: Math.floor(Math.random() * 5) + 1
        };

        if (theme.with_genres) params.with_genres = theme.with_genres;
        if (theme.with_original_language) params.with_original_language = theme.with_original_language;

        let data;
        try {
            data = await fetchWithRetry(`https://api.themoviedb.org/3/${endpoint}`, { params });
        } catch (err) {
            if (err.response && err.response.status === 404) {
                params.page = 1;
                data = await fetchWithRetry(`https://api.themoviedb.org/3/${endpoint}`, { params });
            } else {
                throw err;
            }
        }
        
        const items = data.results;
        
        if (!items || items.length === 0) return;

        // Fetch history
        const getHistory = db.prepare('SELECT movie_id FROM movies_history WHERE guild_id = ?').all(guildId);
        const historySet = new Set(getHistory.map(r => r.movie_id));

        if (historySet.size > 10000) {
            db.prepare('DELETE FROM movies_history WHERE guild_id = ?').run(guildId);
            historySet.clear();
        }

        let selectedItem = null;
        items.sort(() => Math.random() - 0.5);
        for (const item of items) {
            const historyKey = `${isTV ? 'tv' : 'movie'}_${item.id}`;
            if (!historySet.has(historyKey)) {
                selectedItem = item;
                break;
            }
        }

        if (!selectedItem) return;

        const historyKey = `${isTV ? 'tv' : 'movie'}_${selectedItem.id}`;
        db.prepare('INSERT INTO movies_history (guild_id, movie_id) VALUES (?, ?)').run(guildId, historyKey);

        // Fetch deeper details including videos
        const detailsEndpoint = isTV ? `tv/${selectedItem.id}` : `movie/${selectedItem.id}`;
        const details = await fetchWithRetry(`https://api.themoviedb.org/3/${detailsEndpoint}`, {
            params: { api_key: TMDB_API_KEY, append_to_response: 'videos,credits' }
        });

        const title = isTV ? details.name : details.title;
        const imageUrl = details.poster_path 
            ? `https://image.tmdb.org/t/p/w500${details.poster_path}` 
            : 'https://via.placeholder.com/500x750?text=No+Image';

        const tmdbLink = `https://www.themoviedb.org/${isTV ? 'tv' : 'movie'}/${details.id}`;

        const embed = new EmbedBuilder()
            .setColor('#AC00FF')
            .setTitle(title)
            .setURL(tmdbLink)
            .setAuthor({ name: `🍿 ${theme.name}` })
            .setDescription(details.overview ? (details.overview.length > 1000 ? details.overview.substring(0, 1000) + '...' : details.overview) : 'No description available.')
            .setImage(imageUrl)
            .addFields(
                { name: 'Rating', value: `${details.vote_average ? details.vote_average.toFixed(1) : 'N/A'}/10`, inline: true },
                { name: isTV ? 'First Aired' : 'Release Date', value: (isTV ? details.first_air_date : details.release_date) || 'Unknown', inline: true },
                { name: 'Genres', value: details.genres ? details.genres.map(g => g.name).join(', ') : 'None', inline: true }
            )
            .setTimestamp();

        // Add Runtime/Seasons
        if (isTV) {
            embed.addFields({ name: 'Seasons', value: details.number_of_seasons?.toString() || 'Unknown', inline: true });
        } else {
            embed.addFields({ name: 'Runtime', value: details.runtime ? `${details.runtime} mins` : 'Unknown', inline: true });
        }

        // Add Cast
        if (details.credits && details.credits.cast && details.credits.cast.length > 0) {
            const castStr = details.credits.cast.slice(0, 3).map(c => c.name).join(', ');
            embed.addFields({ name: 'Top Cast', value: castStr, inline: false });
        }

        const row = new ActionRowBuilder();

        // Check for Trailer
        let trailerUrl = null;
        if (details.videos && details.videos.results) {
            const trailer = details.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
            if (trailer) {
                trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
            }
        }

        if (trailerUrl) {
            row.addComponents(
                new ButtonBuilder()
                    .setLabel('Watch Trailer')
                    .setURL(trailerUrl)
                    .setStyle(ButtonStyle.Link)
            );
        }

        row.addComponents(
            new ButtonBuilder()
                .setLabel('View on TMDB')
                .setURL(tmdbLink)
                .setStyle(ButtonStyle.Link)
        );

        await channel.send({ embeds: [embed], components: [row] });
    } catch (error) {
        console.error(`Error fetching recommendation for channel ${channel.id}:`, error.message);
    }
}
