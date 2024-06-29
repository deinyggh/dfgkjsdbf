import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, bold } from "discord.js";
import { deleteFile, extractFileId, extractFolderId } from "../utils/common_functions.js";
import { deleteAllFiles, deleteOneFile, listAllFiles, storageCheck } from "../utils/googleapi.js";
import { findProfile, updateData } from "../utils/mongodb.js";

const guides = async (interaction) => {
	try {
		await interaction.deferReply({ephemeral: true});
		const buttons = [
			new ButtonBuilder()
			.setLabel(`Guide Link`)
			.setURL(`https://rentry.org/seremharem`)
			.setStyle(ButtonStyle.Link),
			// new ButtonBuilder()
			// .setLabel(`Server Setup Link`)
			// .setURL(`https://rentry.org/seremharemserver`)
			// .setStyle(ButtonStyle.Link),
			new ButtonBuilder()
			.setLabel(`Supported Sites`)
			.setURL(`https://rentry.org/seremharemsites`)
			.setStyle(ButtonStyle.Link),
			new ButtonBuilder()
			.setLabel(`Hosts Specs`)
			.setURL(`https://rentry.org/seremharemhosts`)
			.setStyle(ButtonStyle.Link),
			// new ButtonBuilder()
			// .setLabel(`Shop`)
			// .setURL(`https://shoppy.gg/@Serem`)
			// .setStyle(ButtonStyle.Link)
		];

		// Define the action row and embed for the response
		const actionRow = new ActionRowBuilder().addComponents(buttons);
		const embed = new EmbedBuilder()
			.setTitle(`Guide Links`)
			.setColor("Random");

		// Send the response
		await interaction.editReply({ embeds: [embed], components: [actionRow] });
	} catch (error) {
		console.log(error);
		try{
			await interaction.reply({ content: 'Check logs for error! Please try again!'});
		}
		catch{}
		return;
	}
}

const banbros_directory = async (interaction) => {
	try {
		await interaction.deferReply({ephemeral: true});
		// const bot_profile = await findProfile({ 'connectionArray.siteName': "bangbros1" });
		const url = "https://botbb.azulium.workers.dev"
		const buttons = [
			new ButtonBuilder()
			.setLabel(`Directory`)
			// .setURL(`${bot_profile.additional_details.bbDirectory}/product/1/videos`)
			.setURL(`${url}/product/1/videos`)
			.setStyle(ButtonStyle.Link),
			
			new ButtonBuilder()
			.setLabel(`Search`)
			// .setURL(`${bot_profile.additional_details.bbDirectory}/product/1/search`)
			.setURL(`${url}/product/1/search`)
			.setStyle(ButtonStyle.Link),

		];

		// Define the action row and embed for the response
		const actionRow = new ActionRowBuilder().addComponents(buttons);
		const embed = new EmbedBuilder()
			.setTitle(`Bangbros Links`)
			.setColor("Random");

		// Send the response
		await interaction.editReply({ embeds: [embed], components: [actionRow] });
	} catch (error) {
		console.log(error);
		try{
			await interaction.reply({ content: 'Check logs for error! Please try again!'});
		}
		catch{}
		return;
	}
}

const host_setting = async (interaction) => {
	await interaction.deferReply({ephemeral: true});
	try {
		const buttons = [
			new ButtonBuilder()
				.setLabel(`G-Drive Shared ID`)
				.setCustomId("G-Drive Shared Drive")
				.setStyle(ButtonStyle.Success),
			new ButtonBuilder()
				.setLabel(`G-Drive Personal ID`)
				.setCustomId("G-Drive Personal Folder")
				.setStyle(ButtonStyle.Success),
			new ButtonBuilder()
				.setLabel(`Mega.nz Details`)
				.setCustomId("Mega.nz")
				.setStyle(ButtonStyle.Danger),
			new ButtonBuilder()
				.setLabel(`Set Personal SA`)
				.setCustomId("Set Personal SA")
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setLabel(`Manage Current Personal SA`)
				.setCustomId("manage_gd_p_sa")
				.setStyle(ButtonStyle.Primary),
		];

		// Define the action row and embed for the response
		const actionRow = new ActionRowBuilder().addComponents(buttons);
		const embed = new EmbedBuilder()
			.setTitle(`Host Settings`)
			.setColor("Random");

		// Send the response
		const response = await interaction.editReply({ embeds: [embed], components: [actionRow], fetchReply: true });
		const collectorFilter = i => i.user.id === interaction.user.id;
		try {
			const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, componentType: ComponentType.Button, max: 1, time: 60 * 1000 });

			// if (confirmation.customId === "Set Personal SA") {
			// 	let response;
			// 	try {
			// 		response = await interaction.member.send({content: "Upload your Service Account File here"});
			// 	} catch (error) {
			// 		await confirmation.update({ content: `Error!`, components: [], embeds: [
			// 			new EmbedBuilder()
			// 			.setColor("DarkRed")
			// 			.setDescription(`You are blocking direct messages. Please enable it for complete bot functions!`)
			// 		] });
			// 		return;
			// 	}
			// 	await confirmation.update({ content: userMention(interaction.user.id), components: [
			// 		new ActionRowBuilder().addComponents([
			// 			new ButtonBuilder()
			// 			.setLabel("Bot Direct Message")
			// 			.setStyle(ButtonStyle.Link)
			// 			.setURL(response.url)
			// 			.setEmoji("🤖")
			// 	])
			// 	], embeds: [
			// 		new EmbedBuilder()
			// 			.setColor("Random")
			// 			.setDescription(`Check Bot's message!`)
			// 	] });

			// 	const collectorFilter = m => m.attachments.size > 0;
			// 	const attachmentCollector = await response.channel.awaitMessages({ filter: collectorFilter, time: 60 * 1000 * 5, max: 1 });
			// 	const attachment = attachmentCollector.first().attachments.first();
			// 	await response.edit({content: `Received attachment: ${bold(attachment.name)}!`})
			// 	if (attachment.size > 1024 * 100) {
			// 		await confirmation.editReply({ content: `Service Account Unreasonably Big!`, components: [], embeds: [] });
			// 		return;
			// 	}
			// 	await updateData(interaction.user, { $set: {
			// 		"userHostDetails.gdrive_personal_sa": attachment.url.trim()
			// 	}});

			// 	await confirmation.editReply({ content: `Service Account Details Updated!`, components: [], embeds: [] });
			// 	return;
			// }
			if (confirmation.customId === "manage_gd_p_sa") {
				const buttons = [
					new ButtonBuilder()
						.setLabel(`List Files`)
						.setCustomId("list_files")
						.setStyle(ButtonStyle.Success),
					new ButtonBuilder()
						.setLabel(`Check Space`)
						.setCustomId("check_space")
						.setStyle(ButtonStyle.Success),
					new ButtonBuilder()
						.setLabel(`Delete File`)
						.setCustomId("delete_file")
						.setStyle(ButtonStyle.Danger),
					new ButtonBuilder()
						.setLabel(`Delete All Files`)
						.setCustomId("delete_all_files")
						.setStyle(ButtonStyle.Danger),
					new ButtonBuilder()
						.setLabel(`Remove SA from Profile`)
						.setCustomId("unset_sa")
						.setStyle(ButtonStyle.Primary),
				];

				// Define the action row and embed for the response
				const actionRow = new ActionRowBuilder().addComponents(buttons);
				const embed = new EmbedBuilder()
					.setTitle(`Manage Current Personal SA`)
					.setColor("Random");

				// Send the response
				const response = await confirmation.update({ embeds: [embed], components: [actionRow], fetchReply: true });
				const collectorFilter = i => i.user.id === interaction.user.id;
				try {
					const manage_sa_confirm = await response.awaitMessageComponent({ filter: collectorFilter, componentType: ComponentType.Button, max: 1, time: 60 * 1000 });

					if (manage_sa_confirm.customId === "unset_sa") {
						await updateData(interaction.user, { $unset: { "userHostDetails.gdrive_personal_sa": 1 }});
						await manage_sa_confirm.update({ content: `Removed SA Details from Profile!`, components: [], embeds: [] });
					} else {
						const userProfile = await findProfile({ "userID": interaction.user.id });
						const sa_json = userProfile.userHostDetails?.gdrive_personal_sa
						if (!sa_json) {
							await manage_sa_confirm.update({ content: ``, components: [], embeds: [
								new EmbedBuilder()
								.setColor("DarkRed")
								.setDescription(`You have not set any Service Account!`)
							] });
							return;
						}
						
						const SaFilePath = JSON.parse(sa_json);
						switch (manage_sa_confirm.customId) {
							case "list_files":
								{
									const list = await listAllFiles(SaFilePath);
									const file_embed = new EmbedBuilder()
									.setColor("Random")
									.setTitle("File List")
									for (const file of list) {
										file_embed.addFields({
											name: file.name, value: file.id, inline: false
										})
									}
									await manage_sa_confirm.update({ content: ``, components: [], embeds: [file_embed] });
								}
							break;
							case "check_space":
								{
									const storage = await storageCheck(SaFilePath);
									await manage_sa_confirm.update({ content: `Used ${parseFloat(storage.usage / (1024*1024*1024)).toFixed(2)} GB out of ${parseInt(storage.limit / (1024*1024*1024))} GB!`, components: [], embeds: [] });
								}
							break;
							case "delete_file":
								{
									const modal = new ModalBuilder()
										.setCustomId('delete_file')
										.setTitle('Delete File');
									const file_id = new TextInputBuilder()
										.setCustomId('file_id')
										.setLabel("Enter G-Drive File link or id!")
										.setStyle(TextInputStyle.Short)
										.setPlaceholder("https://drive.google.com/drive/file/d/1xxxxxxxxxxxxxxxxxxAB")
										.setRequired(true);

									const firstActionRow = new ActionRowBuilder().addComponents(file_id);
									modal.addComponents(firstActionRow);
									await manage_sa_confirm.showModal(modal);
									const submitted_id = await manage_sa_confirm.awaitModalSubmit({ time: 1000 * 60 * 5,
										filter: i => i.user.id === interaction.user.id,
									}).catch(error => {
										console.error(error)
										return null;
									})

									if (submitted_id) {
										await submitted_id.deferReply({ephemeral: true});
										await manage_sa_confirm.deleteReply();
										const file_id_field = submitted_id.fields.getTextInputValue('file_id')
										const file_id = file_id_field.includes("drive.google.com/file/") ? await extractFileId(file_id_field) : file_id_field ;
										await deleteOneFile(SaFilePath, file_id)

										await submitted_id.editReply({content: `File Deleted with id: ${bold(file_id)}!`});
										return;
									}

								}
							break;
							case "delete_all_files":
								{
									await deleteAllFiles(SaFilePath)
									await manage_sa_confirm.update({ content: `All Files Deleted!`, components: [], embeds: [] });
								}
							break;

							default:
							break;
						}
						deleteFile(SaFilePath);
					}
					return;
				}
				catch (error){
					console.log(error);
					await confirmation.editReply({ content: `Error!\n**\`\`\`${error}\`\`\`**`, components: [], embeds: [] });
					if (manage_sa_confirm.customId !== "unset_sa") {deleteFile(`./temp_files/${interaction.id}.json`);}
					return;
				}
			}
			else {
				const modal = new ModalBuilder()
					.setCustomId('host_details_input')
					.setTitle('Enter Details');

				switch (confirmation.customId) {
					case "G-Drive Shared Drive":
					case "G-Drive Personal Folder":
						{
							const folder_id = new TextInputBuilder()
								.setCustomId('folder_id')
								.setLabel("Enter G-Drive Folder link or id!")
								.setStyle(TextInputStyle.Short)
								.setPlaceholder("https://drive.google.com/drive/folders/1xxxxxxxxxxxxxxxxxxAB")
								.setRequired(true);

							const firstActionRow = new ActionRowBuilder().addComponents(folder_id);
							modal.addComponents(firstActionRow);
						}
					break;
					case "Set Personal SA":
						{
							const sa_json = new TextInputBuilder()
								.setCustomId('sa_json')
								.setLabel("Copy all contents of the SA file")
								.setPlaceholder("{ ... }")
								.setStyle(TextInputStyle.Paragraph)
								.setRequired(true);

							const firstActionRow = new ActionRowBuilder().addComponents(sa_json);
							modal.addComponents(firstActionRow);
						}
					break;
					case "Mega.nz":
						{
							const username = new TextInputBuilder()
								.setCustomId('username')
								.setLabel("Enter your Mega.nz Email!")
								.setStyle(TextInputStyle.Short)
								.setPlaceholder('Enter E-Mail!')
								.setRequired(true);

							const password = new TextInputBuilder()
								.setCustomId('password')
								.setLabel("Enter your Mega.nz Password!")
								.setStyle(TextInputStyle.Short)
								.setPlaceholder('Enter Password!')
								.setRequired(true);

							const firstActionRow = new ActionRowBuilder().addComponents(username);
							const secondActionRow = new ActionRowBuilder().addComponents(password);
							modal.addComponents(firstActionRow, secondActionRow);
						}
					break;

					default:
					break;
				}
				await confirmation.showModal(modal);
				const submitted = await confirmation.awaitModalSubmit({ time: 1000 * 60 * 5,
					filter: i => i.user.id === interaction.user.id,
				}).catch(error => {
					console.error(error)
					return null;
				})

				await confirmation.editReply({ content: `Received Details for ${confirmation.customId}!`, components: [], embeds: [] });

				if (submitted) {
					await submitted.deferReply({ephemeral: true});
					await confirmation.deleteReply();
					try {
						let data;
						switch (confirmation.customId) {
							case "G-Drive Shared Drive":
							case "G-Drive Personal Folder":
								{
									const folder_id = await extractFolderId(submitted.fields.getTextInputValue('folder_id'));
									data = confirmation.customId == "G-Drive Shared Drive" ? {"userHostDetails.gdrive_shared": folder_id.trim()} : {"userHostDetails.gdrive_personal": folder_id.trim()};
								}
							break;
							case "Mega.nz":
								{
									const username = submitted.fields.getTextInputValue('username');
									const password = submitted.fields.getTextInputValue('password');
									data = {"userHostDetails.mega.user": username.trim(), "userHostDetails.mega.pass": password.trim()};
								}
							break;
							case "Set Personal SA":
								{
									const sa_json = submitted.fields.getTextInputValue('sa_json');
									data = {"userHostDetails.gdrive_personal_sa": sa_json.trim()};
								}
							break;

							default:
							break;
						}
						await updateData(interaction.user, { $set: data });
						await submitted.editReply({ content: ``, components: [], embeds: [
							new EmbedBuilder()
							.setColor("Green")
							.setDescription(`Details Updated for ${confirmation.customId}!`)
						] });
						return;
					} catch (error) {
						console.log(error);
						await submitted.editReply({ content: ``, components: [], embeds: [
							new EmbedBuilder()
							.setColor("DarkRed")
							.setDescription(`${error}!`)
						] });
						return;
					}
				}
			}

		} catch (error) {
			console.log(error);
			await interaction.editReply({ content: ``, components: [], embeds: [
				new EmbedBuilder()
				.setColor("DarkRed")
				.setDescription(`${error}!`)
			] });
			return;
		}

	} catch (error) {
		console.log(error);
		await interaction.editReply({ content: `Error!\n**\`\`\`${error}\`\`\`**`, components: [], embeds: [] });
		return;
	}
}

const host_update = async (interaction) => {
	try {
		await interaction.deferReply({ephemeral: true});
		await updateData(interaction.user, { $set: {
			"userHostDetails.defaultHost": interaction.values.toString().trim()
		}})
		await interaction.editReply({ content: `Default host updated to **${interaction.values.toString().trim()}**!` });
		setTimeout(async () => {
			await interaction.deleteReply();
		}, 30*1000);
	} catch (error) {
		await interaction.reply({ content: `Error!\n**\`\`\`${error}\`\`\`**`});
	}
}


export {
	banbros_directory,
	guides,
	host_setting,
	host_update
};