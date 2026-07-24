const { EmbedBuilder, ChannelType } = require('discord.js');
const db = require('../database/db');
const cron = require('node-cron');

function enqueueLog(guildId, logText) {
    const insertLog = db.prepare('INSERT INTO log_queue (guild_id, log_text) VALUES (?, ?)');
    insertLog.run(guildId, logText);
}

function startLogFlusher(client) {
    // Run every minute at the 0th second
    cron.schedule('* * * * *', async () => {
        const getGuilds = db.prepare('SELECT DISTINCT guild_id FROM log_queue');
        const guildsToProcess = getGuilds.all();

        if (guildsToProcess.length === 0) return;

        const getLogs = db.prepare('SELECT id, log_text, event_time FROM log_queue WHERE guild_id = ? ORDER BY event_time ASC');
        const deleteLogs = db.prepare('DELETE FROM log_queue WHERE guild_id = ?');

        for (const { guild_id } of guildsToProcess) {
            const logs = getLogs.all(guild_id);
            if (logs.length === 0) continue;

            const guild = client.guilds.cache.get(guild_id);
            if (!guild) {
                deleteLogs.run(guild_id); // Clear logs if guild is completely gone
                continue;
            }

            let logChannel = null;
            const targetId = process.env.LOG_CHANNEL_ID || '1525124336640327750';
            
            if (targetId) {
                logChannel = guild.channels.cache.get(targetId) || await guild.channels.fetch(targetId).catch(() => null);
            }
            
            if (!logChannel) {
                logChannel = guild.channels.cache.find(c => 
                    c.type === ChannelType.GuildText && 
                    c.name.toLowerCase().includes('log')
                );
            }

            if (logChannel) {
                // Group logs into chunks (max 4096 chars for description)
                let currentDescription = '';
                let embeds = [];

                const flushCurrentEmbed = () => {
                    if (currentDescription.length > 0) {
                        const embed = new EmbedBuilder()
                            .setColor('#2F3136') // Dark theme
                            .setTitle('Server Activity')
                            .setDescription(`━━━━━━━━━━━━━━━━━━━━\n\n**Time:**\n${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}\n\n${currentDescription}\n━━━━━━━━━━━━━━━━━━━━`)
                            .setTimestamp();
                        embeds.push(embed);
                        currentDescription = '';
                    }
                };

                for (const log of logs) {
                    const logEntry = `• ${log.log_text}\n`;
                    if (currentDescription.length + logEntry.length > 3900) {
                        flushCurrentEmbed();
                    }
                    currentDescription += logEntry;
                }
                flushCurrentEmbed();

                try {
                    for (const embed of embeds) {
                        await logChannel.send({ embeds: [embed] });
                    }
                } catch (error) {
                    console.error('Failed to send grouped logs:', error);
                }
            }

            // Always delete processed logs to prevent database bloating
            deleteLogs.run(guild_id);
        }
    });
}

module.exports = { enqueueLog, startLogFlusher };
