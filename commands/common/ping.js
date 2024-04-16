import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

// Define the command
const ping_command = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Ping Bot!')
	.setDMPermission(true);

// Define the execute function for the command
const execute = async (interaction) => {
	await interaction.deferReply();
	try {
		await interaction.editReply({
			embeds: [
				new EmbedBuilder()
				.setAuthor({name: "Bot Ping"})
				.setDescription(`🏓 Pong! \n 📡 Ping: ${interaction.client.ws.ping}`)
			]
		});
	} catch (error) {
		console.error(error);
	}

};

// Export the command and its execute function
export default {
	data: ping_command,
	execute,
	cooldown: 60 * 5
};