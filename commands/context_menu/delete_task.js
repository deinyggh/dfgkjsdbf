import { ApplicationCommandType, ContextMenuCommandBuilder, EmbedBuilder } from "discord.js";

// Define the command
const ping_command = new ContextMenuCommandBuilder()
	.setName('Delete Task')
	.setType(ApplicationCommandType.Message);

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