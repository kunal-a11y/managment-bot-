const { enqueueLog } = require('../utils/logger');

module.exports = {
    name: 'roleDelete',
    async execute(role, client) {
        enqueueLog(role.guild.id, `🎭 **Role Deleted:** \`${role.name}\``);
    },
};
