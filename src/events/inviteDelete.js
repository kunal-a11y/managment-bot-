const { enqueueLog } = require('../utils/logger');

module.exports = {
    name: 'inviteDelete',
    async execute(invite, client) {
        if (!invite.guild) return;
        enqueueLog(invite.guild.id, `✉️ **Invite Deleted:** \`${invite.code}\` for channel ${invite.channel}`);
    },
};
