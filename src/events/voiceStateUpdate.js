const { enqueueLog } = require('../utils/logger');

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState, client) {
        if (!newState.guild) return;
        
        const member = newState.member;
        if (!member) return;
        const tag = member.user.tag;

        if (!oldState.channelId && newState.channelId) {
            enqueueLog(newState.guild.id, `🎙️ **Voice Join:** ${tag} joined ${newState.channel}`);
        } else if (oldState.channelId && !newState.channelId) {
            enqueueLog(newState.guild.id, `🎙️ **Voice Leave:** ${tag} left ${oldState.channel}`);
        } else if (oldState.channelId !== newState.channelId) {
            enqueueLog(newState.guild.id, `🎙️ **Voice Move:** ${tag} moved from ${oldState.channel} to ${newState.channel}`);
        } else {
            if (!oldState.mute && newState.mute) enqueueLog(newState.guild.id, `🎙️ **Voice Mute:** ${tag} was muted in ${newState.channel}`);
            if (oldState.mute && !newState.mute) enqueueLog(newState.guild.id, `🎙️ **Voice Unmute:** ${tag} was unmuted in ${newState.channel}`);
            if (!oldState.deaf && newState.deaf) enqueueLog(newState.guild.id, `🎙️ **Voice Deafen:** ${tag} was deafened in ${newState.channel}`);
            if (oldState.deaf && !newState.deaf) enqueueLog(newState.guild.id, `🎙️ **Voice Undeafen:** ${tag} was undeafened in ${newState.channel}`);
            if (!oldState.streaming && newState.streaming) enqueueLog(newState.guild.id, `📺 **Stream Start:** ${tag} started streaming in ${newState.channel}`);
            if (oldState.streaming && !newState.streaming) enqueueLog(newState.guild.id, `📺 **Stream End:** ${tag} stopped streaming in ${newState.channel}`);
        }
    },
};
