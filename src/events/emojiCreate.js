const { enqueueLog } = require('../utils/logger');

module.exports = {
    name: 'emojiCreate',
    async execute(emoji, client) {
        enqueueLog(emoji.guild.id, `😀 **Emoji Created:** ${emoji} (\`${emoji.name}\`)`);
    },
};
