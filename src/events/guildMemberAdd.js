const { EmbedBuilder, ChannelType } = require('discord.js');
const { sendLog } = require('../utils/logger');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client) {
        const guild = member.guild;
        
        // --- LOGGING ---
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Member Joined')
            .setDescription(`${member.user.tag} has joined the server.`)
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp();
            
        // Check if the joined member is a bot
        if (member.user.bot) {
            embed.setTitle('Bot Joined');
            embed.setDescription(`Bot ${member.user.tag} was added to the server.`);
        }

        await sendLog(guild, embed);

        // --- ANTI-RAID SYSTEM (20 joins in 10 seconds) ---
        if (!member.user.bot) {
            const now = Date.now();
            
            // Initialize or reset if time window passed
            if (!client.joinTracker.firstJoinTimestamp || (now - client.joinTracker.firstJoinTimestamp) > 10000) {
                client.joinTracker.count = 1;
                client.joinTracker.firstJoinTimestamp = now;
            } else {
                client.joinTracker.count++;
                
                if (client.joinTracker.count >= 20) {
                    console.log('🚨 RAID DETECTED! Triggering Lockdown...');
                    
                    // Reset tracker to avoid repeated instant triggers
                    client.joinTracker.count = 0;
                    client.joinTracker.firstJoinTimestamp = now;

                    // Trigger lockdown
                    let successCount = 0;
                    for (const [channelId, channel] of guild.channels.cache) {
                        try {
                            if (channel.type === ChannelType.GuildText) {
                                await channel.permissionOverwrites.edit(guild.roles.everyone, {
                                    SendMessages: false
                                });
                                successCount++;
                            } else if (channel.type === ChannelType.GuildVoice) {
                                await channel.permissionOverwrites.edit(guild.roles.everyone, {
                                    Connect: false
                                });
                                successCount++;
                            }
                        } catch (err) {
                            console.error(`Failed to lock channel ${channel.name}:`, err);
                        }
                    }

                    // Send alert to log channel
                    const alertEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('🚨 RAID DETECTED 🚨')
                        .setDescription(`More than 20 joins in 10 seconds. Server has been locked down. Restricted ${successCount} channels.`)
                        .setTimestamp();
                    await sendLog(guild, alertEmbed);
                }
            }
        }
    },
};
