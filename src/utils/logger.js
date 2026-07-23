const { EmbedBuilder, ChannelType } = require('discord.js');

async function sendLog(guild, embed) {
    // 1. Try to fetch by hardcoded ID from .env
    let logChannel = null;
    const targetId = process.env.LOG_CHANNEL_ID || '1525124336640327750';
    
    if (targetId) {
        logChannel = guild.channels.cache.get(targetId);
    }
    
    // 2. Fallback to name search if ID is missing or channel not found
    if (!logChannel) {
        logChannel = guild.channels.cache.find(c => 
            c.type === ChannelType.GuildText && 
            c.name.toLowerCase().includes('log')
        );
    }
    
    if (logChannel) {
        try {
            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Failed to send log to log channel:', error);
        }
    } else {
        console.error('Could not find any channel to send logs to.');
    }
}

module.exports = { sendLog };
