// Hardcoded sensitive role IDs provided by the user
const ADMIN_ID = '1522825304899584100';
const OWNER_ID = '1522824974878904440';

/**
 * Checks if the member has the required permissions to run a sensitive command.
 * It checks if they are the guild owner, or if they have the specific Admin or Owner roles/IDs.
 */
function isAuthorized(member) {
    if (!member) return false;

    // Check if they are the actual server owner
    if (member.guild && member.id === member.guild.ownerId) return true;

    // Check if their User ID matches
    if (member.id === ADMIN_ID || member.id === OWNER_ID) return true;

    // Check if they have the roles
    if (member.roles && member.roles.cache) {
        if (member.roles.cache.has(ADMIN_ID) || member.roles.cache.has(OWNER_ID)) {
            return true;
        }
    }

    // Fallback: check if they have Administrator permission in Discord
    if (member.permissions && member.permissions.has('Administrator')) return true;

    return false;
}

module.exports = { isAuthorized };
