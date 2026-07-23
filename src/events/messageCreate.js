const { EmbedBuilder } = require('discord.js');
const { sendLog } = require('../utils/logger');

// A simple list of bad words. 
// In a real production environment, you might want to fetch this from an API or a database.
const BAD_WORDS = ['badword1', 'badword2', 'abusiveword', 'spamword'];

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot) return; // Ignore bots
        
        const contentLower = message.content.toLowerCase();
        
        // Anti-abuse scanner
        let containsBadWord = false;
        for (const word of BAD_WORDS) {
            if (contentLower.includes(word)) {
                containsBadWord = true;
                break;
            }
        }
        
        if (containsBadWord) {
            try {
                await message.delete();
                const warningMsg = await message.channel.send(`⚠️ ${message.author}, please do not use abusive language in this server.`);
                
                // Auto delete the warning after 5 seconds to keep chat clean
                setTimeout(() => warningMsg.delete().catch(() => {}), 5000);
                
                // Log the abuse
                const embed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('Abusive Message Deleted')
                    .setDescription(`An abusive message by ${message.author.tag} was deleted in ${message.channel}.`)
                    .addFields({ name: 'Content', value: message.content })
                    .setTimestamp();
                    
                await sendLog(message.guild, embed);
                
            } catch (error) {
                console.error('Could not delete abusive message:', error);
            }
        }
    },
};
