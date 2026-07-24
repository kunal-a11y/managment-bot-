const { enqueueLog } = require('../utils/logger');

module.exports = {
    name: 'emojiDelete',
    async execute(emoji, client) {
        enqueueLog(emoji.guild.id, `😀 **Emoji Deleted:** \`${emoji.name}\``);
    },
};
