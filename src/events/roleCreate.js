const { enqueueLog } = require('../utils/logger');

module.exports = {
    name: 'roleCreate',
    async execute(role, client) {
        enqueueLog(role.guild.id, `🎭 **Role Created:** \`${role.name}\``);
    },
};
