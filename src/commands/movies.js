const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const cron = require('node-cron');
const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;

const THEMES = [
    { name: 'Business / Finance', query: 'finance wall street business' },
    { name: 'Latest Hits', type: 'latest' },
    { name: 'Marvel / Avengers', query: 'avengers marvel' },
    { name: 'DC Universe', query: 'batman superman justice league' },
    { name: 'Bollywood Blockbusters', language: 'hi', region: 'IN' },
    { name: 'Hollywood Highlights', language: 'en', region: 'US' }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('movies')
        .setDescription('Setup an auto-poster for themed movie suggestions every 5 minutes.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send movie suggestions to')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
        // Acknowledge interaction immediately to prevent timeout errors
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const channel = interaction.options.getChannel('channel');
        const guildId = interaction.guild.id;

        if (!TMDB_API_KEY) {
            return interaction.editReply({ content: 'TMDB API Key is missing in the .env file!' });
        }

        if (interaction.client.moviesIntervals.has(guildId)) {
            const existingTask = interaction.client.moviesIntervals.get(guildId);
            existingTask.stop();
        }

        // Send one immediately
        await sendRealMovieSuggestion(channel);

        // Schedule to run every 5 minutes: */5 * * * *
        const task = cron.schedule('*/5 * * * *', async () => {
            await sendRealMovieSuggestion(channel);
        });

        interaction.client.moviesIntervals.set(guildId, task);

        await interaction.editReply({ content: `✅ Successfully set up Themed Movie suggestions every 5 minutes in ${channel}! (A sample has been sent now)` });
    },
};

    async function sendRealMovieSuggestion(channel) {
    try {
        const theme = THEMES[Math.floor(Math.random() * THEMES.length)];
        let url = 'https://api.themoviedb.org/3/discover/movie';
        let params = {
            api_key: TMDB_API_KEY,
            sort_by: 'popularity.desc',
            page: Math.floor(Math.random() * 5) + 1 // Increased to random page 1-5 for much more variety
        };

        if (theme.query) {
            url = 'https://api.themoviedb.org/3/search/movie';
            params.query = theme.query;
            delete params.sort_by; // search doesn't use sort_by
            params.page = Math.floor(Math.random() * 2) + 1; // Allow page 1 or 2 for searches to increase variety
        } else if (theme.type === 'latest') {
            const date = new Date().toISOString().split('T')[0];
            params['primary_release_date.lte'] = date;
            params['release_date.lte'] = date;
        } else {
            if (theme.language) params.with_original_language = theme.language;
            if (theme.region) params.region = theme.region;
        }

        let retries = 3;
        let response;
        while (retries > 0) {
            try {
                response = await axios.get(url, { params, timeout: 10000 }); // Added 10s timeout
                break;
            } catch (err) {
                retries--;
                if (retries === 0) throw err;
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retrying
            }
        }
        
        const movies = response.data.results;
        
        if (!movies || movies.length === 0) return;

        // Pick a random movie from the top 20 instead of top 10
        const randomMovie = movies[Math.floor(Math.random() * Math.min(20, movies.length))];
        
        const imageUrl = randomMovie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${randomMovie.poster_path}` 
            : 'https://via.placeholder.com/500x750?text=No+Image';

        const tmdbLink = `https://www.themoviedb.org/movie/${randomMovie.id}`;

        const embed = new EmbedBuilder()
            .setColor('#AC00FF') // Purple color
            .setTitle(randomMovie.title || randomMovie.original_title)
            .setURL(tmdbLink)
            .setAuthor({ name: `🍿 Theme: ${theme.name}` })
            .setDescription(randomMovie.overview ? randomMovie.overview.substring(0, 2048) : 'No description available.')
            .setImage(imageUrl)
            .setFooter({ text: `Rating: ${randomMovie.vote_average}/10` })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('View on TMDB')
                    .setURL(tmdbLink)
                    .setStyle(ButtonStyle.Link)
            );

        await channel.send({ embeds: [embed], components: [row] });
    } catch (error) {
        console.error(`Error fetching real movie suggestion for channel ${channel.id}:`, error.message);
    }
}
