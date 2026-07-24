const axios = require('axios');
const TMDB_API_KEY = 'c61a135cd7409919044709314599734c';

const THEMES = [
    { name: 'Business / Finance', query: 'finance wall street business' },
    { name: 'Latest Hits', type: 'latest' },
    { name: 'Marvel / Avengers', query: 'avengers marvel' },
    { name: 'DC Universe', query: 'batman superman justice league' },
    { name: 'Bollywood Blockbusters', language: 'hi', region: 'IN' },
    { name: 'Hollywood Highlights', language: 'en', region: 'US' }
];

async function test() {
    for (const theme of THEMES) {
        let url = 'https://api.themoviedb.org/3/discover/movie';
        let params = {
            api_key: TMDB_API_KEY,
            sort_by: 'popularity.desc',
            page: 1
        };

        if (theme.query) {
            url = 'https://api.themoviedb.org/3/search/movie';
            params.query = theme.query;
            delete params.sort_by;
            params.page = 1;
        } else if (theme.type === 'latest') {
            const date = new Date().toISOString().split('T')[0];
            params['primary_release_date.lte'] = date;
            params['release_date.lte'] = date;
        } else {
            if (theme.language) params.with_original_language = theme.language;
            if (theme.region) params.region = theme.region;
        }

        try {
            const response = await axios.get(url, { params });
            const movies = response.data.results;
            console.log(`Theme: ${theme.name} | URL: ${url} | Results: ${movies.length}`);
            if (movies.length === 0) {
                console.error(`WARNING: 0 results for theme ${theme.name}!`);
            }
        } catch (error) {
            console.error(`Error for theme ${theme.name}:`, error.message);
        }
    }
}

test();
