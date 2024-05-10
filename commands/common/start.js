import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";

// Define the command
const start_command = new SlashCommandBuilder()
	.setName('start')
	.setDescription('Send Initial Buttons!')
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.setDMPermission(false);

// Define the execute function for the command
const execute = async (interaction) => {
	await interaction.deferReply({ephemeral: true});
	try {
		const embed = new EmbedBuilder()
			.setTitle("Information")
			.setAuthor({ name: interaction.client.user.displayName, iconURL: interaction.client.user.displayAvatarURL({ format: "png" , size: 4096 , dynamic: false})})
			.setColor("Random")
			.setThumbnail("https://i.imgur.com/GzYrhYK.gif")
			.setFooter({text: `Stay Horny, Spread Horny!`, iconURL: 'https://i.imgur.com/htKfpMj.jpeg'})
			.addFields(
				{ name: "Link", value: "Enter Supported Link", inline: false },
				// { name: "Pornportal ID", value: "Enter Pornportal ID or Link", inline: false },
				{ name: "BB Network ID", value: "Enter BB Network ID", inline: false },
				{ name: "Host Settings", value: "All Host related settings", inline: false },
				{ name: "Guides and Info", value: "Links to bot guide and information", inline: false },
			)
			.setTimestamp();

		const buttons = [
			new ButtonBuilder()
				.setLabel(`Link`)
				.setCustomId("common")
				.setDisabled(false)
				.setStyle(ButtonStyle.Success),
			// new ButtonBuilder()
			// 	.setLabel(`Pornportal ID`)
			// 	.setCustomId("pornportal")
			// 	.setDisabled(true)
			// 	.setStyle(ButtonStyle.Success),
			new ButtonBuilder()
				.setLabel(`BB Network ID`)
				.setCustomId("bbnetwork")
				.setDisabled(false)
				.setStyle(ButtonStyle.Success),
			new ButtonBuilder()
				.setLabel(`Host Details`)
				.setCustomId("host_setting")
				.setDisabled(false)
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setLabel(`Guides and Info`)
				.setCustomId("guide")
				.setDisabled(false)
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setLabel("Bangbros Directory")
				.setStyle(ButtonStyle.Link)
				.setURL("https://botbb.mosis.workers.dev/product/1/videos")
		];
		
		const select = new StringSelectMenuBuilder()
			.setCustomId('host_update')
			.setPlaceholder('Select your Host!')
			.setMinValues(1)
			.setMaxValues(1)
			.addOptions(
				// new StringSelectMenuOptionBuilder()
				// 	.setLabel('G-Drive Shared Drive')
				// 	.setDescription('Google Drive Shared Drives or Team Drives.')
				// 	.setValue('G-Drive Shared Drive'),
				// new StringSelectMenuOptionBuilder()
				// 	.setLabel('G-Drive Personal Folder')
				// 	.setDescription('Google Drive Personal Folder backed by your own Service Accounts.')
				// 	.setValue('G-Drive Personal Folder'),
				new StringSelectMenuOptionBuilder()
					.setLabel('G-Drive Public SA')
					.setDescription("Google Drive Personal Folder backed by your bot's Service Accounts.")
					.setValue('G-Drive Public SA'),
				// new StringSelectMenuOptionBuilder()
				// 	.setLabel('Mega.nz')
				// 	.setDescription('Your Mega.nz Account.')
				// 	.setValue('Mega.nz'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Direct Link')
					.setDescription("Direct Link to some supported networks.")
					.setValue('Direct Link'),
			);

		const row = new ActionRowBuilder().addComponents(select);
		const actionRow = new ActionRowBuilder().addComponents(buttons);
		await interaction.channel.send({embeds: [embed], components: [row, actionRow] });
		await interaction.editReply({content: "Initial Buttons Sent!"});
	} catch (error) {
		console.error(error);
		await interaction.editReply({content: "Failed to send Initial Buttons!"});
	}

};

// Export the command and its execute function
export default {
	data: start_command,
	execute,
	cooldown: 60 * 5
};