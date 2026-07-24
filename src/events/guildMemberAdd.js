const { enqueueLog } = require('../utils/logger');
const { ChannelType, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client) {
        const guild = member.guild;
        
        if (member.user.bot) {
            enqueueLog(guild.id, `🤖 **Bot Joined:** ${member.user.tag} (${member.id})`);
        } else {
            enqueueLog(guild.id, `👋 **Member Joined:** ${member.user.tag} (${member.id})`);
        }

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

                    enqueueLog(guild.id, `🚨 **RAID DETECTED:** More than 20 joins in 10 seconds. Server locked down. Restricted ${successCount} channels.`);
                }
            }
        }
    },
};
