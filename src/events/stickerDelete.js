const { enqueueLog } = require('../utils/logger');

module.exports = {
    name: 'stickerDelete',
    async execute(sticker, client) {
        enqueueLog(sticker.guild.id, `🖼️ **Sticker Deleted:** \`${sticker.name}\``);
    },
};
