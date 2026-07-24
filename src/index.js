require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Partials, ActivityType, Events, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildModeration,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.GuildMember]
});

client.commands = new Collection();
client.moviesIntervals = new Map();
client.gamesIntervals = new Map();
client.joinTracker = { count: 0, firstJoinTimestamp: null }; // Anti-raid tracker

// Load commands
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        }
    }
}

// Load events
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }
}

const { startLogFlusher } = require('./utils/logger');

client.once(Events.ClientReady, () => {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    client.user.setActivity('Managing the Server', { type: ActivityType.Watching });
    startLogFlusher(client);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        // Handle Unknown Interaction / Already replied errors gracefully
        const ignoreCodes = [10062, 40060];
        if (ignoreCodes.includes(error.code)) return; // Ignore expired/duplicate interactions entirely

        console.error(`Error executing ${interaction.commandName}:`, error);
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral }).catch(e => {
                if (!ignoreCodes.includes(e.code)) console.error('Failed to followUp error:', e);
            });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral }).catch(e => {
                if (!ignoreCodes.includes(e.code)) console.error('Failed to reply error:', e);
            });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
