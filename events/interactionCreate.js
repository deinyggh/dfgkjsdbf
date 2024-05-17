import { Collection, Events } from "discord.js";
import { guides, host_setting, host_update } from "../buttons/general_buttons.js";
import { generate_link } from "../buttons/generate_link.js";

const interactionCreate = async (interaction) => {
	if (interaction.user.bot) return;

	try {
		if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);
			if (!command) return;
			const { cooldowns } = interaction.client;
	
			if (!cooldowns.has(command.data.name)){
				cooldowns.set(command.data.name, new Collection());
			}
	
			const now = Date.now();
			const timestamps = cooldowns.get(command.data.name);
			const defaultCooldownDuration = 10;
			const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;
	
			if (timestamps.has(interaction.user.id)) {
				const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
	
				if (now < expirationTime) {
					const expiredTimestamp = Math.round(expirationTime / 1000);
					return interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, ephemeral: true });
				}
			}
	
			timestamps.set(interaction.user.id, now);
			setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
	
			try {
				await command.execute(interaction);
				console.log(`${interaction.user.username} in #${interaction.channel.name || 'DM'} used ${command.data.name}.`);
			} catch (error) {
				console.error(error);
				try {
					await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
				} catch {
					await interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
				}
			}
		}
		else if (interaction.isButton()) {
			switch (interaction.customId) {
				case "common":
				case "pornportal":
				case "bbnetwork":
					{
						await generate_link(interaction);
					}
				break;
	
				case "guide":
					{
						await guides(interaction);
					}
				break;
	
				case "host_setting":
					{
						await host_setting(interaction);
					}
				break;
	
				default:
				break;
			}
			console.log(`${interaction.user.username} in #${interaction.channel.name || 'DM'} used ${interaction.customId}.`);
		}
		else if (interaction.isStringSelectMenu()) {
			switch (interaction.customId) {
				case "host_update":
					{
						await host_update(interaction);
					}
				break;
	
				default:
				break;
			}
		}
		else {
			return;
		}
	} catch (error) {
		console.log(error);
		try {
			await interaction.reply({ content: `There was an error while executing this command!`, ephemeral: true , components: [], embeds: [
				new EmbedBuilder()
				.setColor("DarkRed")
				.setDescription(`${error}`)
			] });
		} catch {
			await interaction.editReply({ content: `There was an error while executing this command!`, ephemeral: true , components: [], embeds: [
				new EmbedBuilder()
				.setColor("DarkRed")
				.setDescription(`${error}`)
			] });
		}
	}

	
};

export default {
	name: Events.InteractionCreate,
	execute: interactionCreate
};
