const { enqueueLog } = require('../utils/logger');

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage, client) {
        if (newMessage.author && newMessage.author.bot) return;
        if (oldMessage.content === newMessage.content) return; // Ignore embeds loading or pins

        const authorTag = newMessage.author ? newMessage.author.tag : 'Unknown User';
        
        const oldStr = oldMessage.content ? `"${oldMessage.content.substring(0, 50)}${oldMessage.content.length > 50 ? '...' : ''}"` : 'Unknown';
        const newStr = newMessage.content ? `"${newMessage.content.substring(0, 50)}${newMessage.content.length > 50 ? '...' : ''}"` : 'Unknown';

        enqueueLog(newMessage.guild.id, `✏️ **Message Edited:** by ${authorTag} in ${newMessage.channel}. [Jump](${newMessage.url})\nOld: ${oldStr}\nNew: ${newStr}`);
    },
};
