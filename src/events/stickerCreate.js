const { enqueueLog } = require('../utils/logger');

module.exports = {
    name: 'stickerCreate',
    async execute(sticker, client) {
        enqueueLog(sticker.guild.id, `🖼️ **Sticker Created:** \`${sticker.name}\``);
    },
};
