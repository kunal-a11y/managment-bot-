const { enqueueLog } = require('../utils/logger');

module.exports = {
    name: 'channelUpdate',
    async execute(oldChannel, newChannel, client) {
        if (!newChannel.guild) return;
        
        let changes = [];
        if (oldChannel.name !== newChannel.name) changes.push(`Name: \`${oldChannel.name}\` -> \`${newChannel.name}\``);
        if (oldChannel.parentId !== newChannel.parentId) changes.push(`Category changed`);
        if (oldChannel.topic !== newChannel.topic) changes.push(`Topic changed`);
        if (oldChannel.nsfw !== newChannel.nsfw) changes.push(`NSFW: ${oldChannel.nsfw} -> ${newChannel.nsfw}`);
        
        if (changes.length > 0) {
            enqueueLog(newChannel.guild.id, `⚙️ **Channel Updated:** ${newChannel} (\`${newChannel.name}\`)\nChanges: ${changes.join(', ')}`);
        }
    },
};
