const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    const channelId = '1525124336640327750';
    try {
        const channel = await client.channels.fetch(channelId);
        if (channel) {
            console.log(`Successfully found channel: ${channel.name} in guild: ${channel.guild.name}`);
            await channel.send('Test message from script');
            console.log('Successfully sent message.');
        }
    } catch (err) {
        console.error('Error fetching channel:', err.message);
    }
    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
