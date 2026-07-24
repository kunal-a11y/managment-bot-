const { enqueueLog } = require('../utils/logger');

module.exports = {
    name: 'guildUpdate',
    async execute(oldGuild, newGuild, client) {
        let changes = [];
        if (oldGuild.name !== newGuild.name) changes.push(`Name: \`${oldGuild.name}\` -> \`${newGuild.name}\``);
        if (oldGuild.icon !== newGuild.icon) changes.push(`Icon changed`);
        if (oldGuild.banner !== newGuild.banner) changes.push(`Banner changed`);
        if (oldGuild.verificationLevel !== newGuild.verificationLevel) changes.push(`Verification: ${oldGuild.verificationLevel} -> ${newGuild.verificationLevel}`);
        if (oldGuild.premiumSubscriptionCount !== newGuild.premiumSubscriptionCount) changes.push(`Boosts: ${oldGuild.premiumSubscriptionCount} -> ${newGuild.premiumSubscriptionCount}`);

        if (changes.length > 0) {
            enqueueLog(newGuild.id, `⚙️ **Server Updated:**\nChanges: ${changes.join(', ')}`);
        }
    },
};
