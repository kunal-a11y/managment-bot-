const axios = require('axios');

async function fetchWithRetry(url, options = {}, retries = 3, backoff = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios({
                url,
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ManagementBot/2.0',
                    'Accept': 'application/json',
                    ...options.headers
                },
                ...options
            });
            return response.data;
        } catch (error) {
            // Check if it's a 404, if so, we probably requested a page out of bounds. Throw immediately so caller can handle.
            if (error.response && error.response.status === 404) {
                throw error;
            }
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, backoff * Math.pow(2, i))); // Exponential backoff
        }
    }
}

module.exports = { fetchWithRetry };
