import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import fs from "node:fs";
import path from "node:path";
import keepAlive from "./server.js";

// Create a new client instance
const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.DirectMessages,
	GatewayIntentBits.MessageContent,
], partials: [Partials.Channel] });

client.commands = new Collection();
client.cooldowns = new Collection();

const currentDir = process.cwd();
const foldersPath = path.join(currentDir, 'commands');

const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const { default: command } = await import(`./commands/${folder}/${file}`)
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = path.join(currentDir, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const { default: event } = await import(`./events/${file}`)
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}
const token = process.env['token'];
keepAlive(client, token);
client.login(token);