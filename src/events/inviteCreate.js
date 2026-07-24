const { enqueueLog } = require('../utils/logger');

module.exports = {
    name: 'inviteCreate',
    async execute(invite, client) {
        if (!invite.guild) return;
        enqueueLog(invite.guild.id, `✉️ **Invite Created:** \`${invite.code}\` by ${invite.inviter ? invite.inviter.tag : 'Unknown'} for channel ${invite.channel}`);
    },
};
