const axios = require('axios');

async function fetchWithRetry(url, options = {}, retries = 3, backoff = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios({
                url,
                timeout: 10000,
                ...options
            });
            return response.data;
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, backoff * Math.pow(2, i))); // Exponential backoff
        }
    }
}

module.exports = { fetchWithRetry };
