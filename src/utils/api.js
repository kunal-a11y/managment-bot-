const axios = require('axios');
const https = require('https');

const httpsAgent = new https.Agent({
    keepAlive: true,
    rejectUnauthorized: false // Helps bypass strict SSL renegotiation issues that can cause ECONNRESET
});

async function fetchWithRetry(url, options = {}, retries = 3, backoff = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios({
                url,
                timeout: 15000,
                httpsAgent,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ManagementBot/2.0',
                    'Accept': 'application/json',
                    'Connection': 'keep-alive',
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
            
            // Console log the retry attempt for debugging
            console.error(`[API Retry ${i + 1}/${retries}] Fetch failed for ${url}: ${error.message}`);
            
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, backoff * Math.pow(2, i))); // Exponential backoff
        }
    }
}

module.exports = { fetchWithRetry };
