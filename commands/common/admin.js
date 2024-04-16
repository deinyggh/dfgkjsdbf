import { ActionRowBuilder, EmbedBuilder, ModalBuilder, PermissionFlagsBits, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import userProfiles from "../../models/userProfiles.js";
import { createDefaultProfile, findProfile, updateData } from "../../utils/mongodb.js";
import fs from "node:fs";
import bangbros from "../../utils/sites/bangbros.js";
import saSchema from "../../models/saSchema.js";
import { wait, walk } from "../../utils/common_functions.js";
import { deleteAllFiles, storageCheck } from "../../utils/googleapi.js";

// Define the command
const admin_command = new SlashCommandBuilder()
	.setName('admin')
	.setDescription('Admin Commands!')
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.addSubcommand(subcommand => subcommand
		.setName("bot_settings")
		.setDescription("Update Bot Settings and Limits")
	)
	.addSubcommandGroup(subcommandGroup => subcommandGroup
		.setName("update")
		.setDescription("Update Details")
		.addSubcommand(subcommand => subcommand
			.setName("credentials")
			.setDescription("Update Credentials")
		)
		.addSubcommand(subcommand => subcommand
			.setName("connection")
			.setDescription("Update Connection Details")
		)
	)
	.addSubcommand(subcommand => subcommand
        .setName('list_servers')
        .setDescription('List All Servers')
    )
	.addSubcommand(subcommand => subcommand
        .setName('bb_db_generate')
        .setDescription('Generate/Update DB')
    )
    .addSubcommand(subcommand => subcommand
        .setName('server_remove')
        .setDescription('Remove bot from the server')
        .addStringOption(option => option
            .setName('server_id')
            .setDescription('Enter Server ID')
            .setRequired(true)
        )
    )
	.addSubcommand(subcommand => subcommand
        .setName('sa_db_generate')
        .setDescription('Generate/Update SA DB')
    )
	.setDMPermission(false);

// Define the execute function for the command
const execute = async (interaction) => {
	switch (interaction.options.getSubcommand()) {
		case "bot_settings":
			{
				try {
					const modal = new ModalBuilder()
						.setCustomId('bot_settings')
						.setTitle('Enter Details');

					const boost_premium = new TextInputBuilder()
						.setCustomId('boost_premium')
						.setLabel("Should server boosters be premium ?")
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('t or f')
						.setMinLength(1)
						.setMaxLength(1)
						.setRequired(false);

					const limit_direct_link = new TextInputBuilder()
						.setCustomId('limit_direct_link')
						.setLabel("Daily limit for Direct Link Host!")
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('Enter Number!')
						.setRequired(false);

					const limit_transfer_link = new TextInputBuilder()
						.setCustomId('limit_transfer_link')
						.setLabel("Daily limit for Non Direct Link Hosts!")
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('Enter Number!')
						.setRequired(false);

					const bot_channel_id = new TextInputBuilder()
						.setCustomId('bot_channel_id')
						.setLabel("Bot main channel ID!")
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('Enter Channel ID!')
						.setRequired(false);

					const firstActionRow = new ActionRowBuilder().addComponents(boost_premium);
					const secondActionRow = new ActionRowBuilder().addComponents(limit_direct_link);
					const thirdActionRow = new ActionRowBuilder().addComponents(limit_transfer_link);
					const fourthActionRow = new ActionRowBuilder().addComponents(bot_channel_id);
					modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow);

					await interaction.showModal(modal);
					const submitted = await interaction.awaitModalSubmit({ time: 1000 * 60 * 5,
						filter: i => i.user.id === interaction.user.id,
					}).catch(error => {
						console.error(error)
						return null;
					})

				if (submitted) {
					await submitted.deferReply({ephemeral: true});
					let botProfile = await findProfile({ "userID": interaction.client.user.id});
					if (!botProfile) {
						botProfile = await createDefaultProfile(interaction.client.user)
					}
					let boost_premium_data = false;

					if (submitted.fields.getTextInputValue('boost_premium') === "t") {
						boost_premium_data = true;
					} else if (botProfile.additional_details?.botBoosterPremium) {
						boost_premium_data = botProfile.additional_details.botBoosterPremium;
					}

					const limit_direct_link = Number(submitted.fields.getTextInputValue('limit_direct_link')) ?? Number(botProfile.additional_details?.botDailyLimit?.generate) ?? 0;
					const limit_transfer_link = Number(submitted.fields.getTextInputValue('limit_transfer_link')) ?? Number(botProfile.additional_details?.botDailyLimit?.givelink) ?? 0;
					const bot_channel_id = submitted.fields.getTextInputValue('bot_channel_id') ?? botProfile.additional_details?.botChannelID ?? "";

					await updateData(interaction.client.user, {
						"additional_details.botBoosterPremium": boost_premium_data,
						"additional_details.botChannelID": bot_channel_id,
						"additional_details.botDailyLimit.generate": parseInt(limit_direct_link),
						"additional_details.botDailyLimit.givelink": parseInt(limit_transfer_link)
					});

					await submitted.editReply({content: `Bot Details Updated!`});
				}
				} catch (error) {
					console.error(error);
					return;
				}
			}
		break;

		case "credentials":
			{
				const site = new TextInputBuilder()
					.setCustomId('site')
					.setLabel("What's the site name?")
					.setStyle(TextInputStyle.Short)
					.setRequired(true);

				const user = new TextInputBuilder()
					.setCustomId('user')
					.setLabel("Username?")
					.setStyle(TextInputStyle.Short)
					.setRequired(true);

				const pass = new TextInputBuilder()
					.setCustomId('pass')
					.setLabel("Password?")
					.setStyle(TextInputStyle.Short)
					.setRequired(true);

				const inputModal = new ModalBuilder()
					.setCustomId(`CredModal`)
					.setTitle(`Credential Details`)
					.setComponents(
						new ActionRowBuilder().addComponents(site),
						new ActionRowBuilder().addComponents(user),
						new ActionRowBuilder().addComponents(pass)
					)
				;
				await interaction.showModal(inputModal);
				const submitted = await interaction.awaitModalSubmit({ time: 1000 * 60 * 5,
					filter: i => i.user.id === interaction.user.id,
				}).catch(error => {
					console.error(error)
					return null
				})

				if (submitted) {
					await submitted.deferReply({ephemeral: true});
					const site = submitted.fields.getTextInputValue('site');
					const user = submitted.fields.getTextInputValue('user');
					const pass = submitted.fields.getTextInputValue('pass');

					const bot_profile = await findProfile({ "userID": interaction.client.user.id });
					const check = bot_profile.connectionDetailArray?.find(detail => detail.siteName === site.trim());
					if (!check){
						await updateData(interaction.client.user, { $push: {
							connectionDetailArray: {
								siteName: site,
								user: user,
								pass: pass
							}
						}});
						await submitted.editReply({content: "Details Added!"})
					}
					else{
						await userProfiles.findOneAndUpdate({ "connectionDetailArray.siteName": site.trim() }, { $set: {
							"connectionDetailArray.$.user": user,
							"connectionDetailArray.$.pass": pass
						}});
						await submitted.editReply({content: "Details Updated!"})
					}
					return;
				}
				try {await interaction.deleteReply();} catch {}
			}
		break;

		case "connection":
			{
				const site_name = new TextInputBuilder()
					.setCustomId('site_name')
					.setLabel("What's the site name?")
					.setStyle(TextInputStyle.Short)
					.setRequired(true);

				const site_domain = new TextInputBuilder()
					.setCustomId('site_domain')
					.setLabel("What's the site domain?")
					.setStyle(TextInputStyle.Short)
					.setRequired(false);

				const api_auth = new TextInputBuilder()
					.setCustomId('api_auth')
					.setLabel("What's the authorisation code?")
					.setStyle(TextInputStyle.Paragraph)
					.setRequired(true);

				const test_site = new TextInputBuilder()
					.setCustomId('test_site')
					.setLabel("What's link to test authorisation?")
					.setStyle(TextInputStyle.Short)
					.setRequired(false);

				const description = new TextInputBuilder()
					.setCustomId('description')
					.setLabel("Description")
					.setStyle(TextInputStyle.Paragraph)
					.setRequired(false);

				const inputModal = new ModalBuilder()
				.setCustomId(`ConnectionModal`)
				.setTitle(`Connection Details`)
				.setComponents(
					new ActionRowBuilder().addComponents(site_name),
					new ActionRowBuilder().addComponents(site_domain),
					new ActionRowBuilder().addComponents(api_auth),
					new ActionRowBuilder().addComponents(test_site),
					new ActionRowBuilder().addComponents(description)
				);

				await interaction.showModal(inputModal);
				const submitted = await interaction.awaitModalSubmit({ time: 1000 * 60 * 5,
					filter: i => i.user.id === interaction.user.id,
				}).catch(error => {
					console.error(error)
					return null
				})

				if (submitted) {
					await submitted.deferReply({ephemeral: true});
					const site_name = submitted.fields.getTextInputValue('site_name');
					const site_domain = submitted.fields.getTextInputValue('site_domain');
					const api_auth = submitted.fields.getTextInputValue('api_auth');
					const test_site = submitted.fields.getTextInputValue('test_site');
					const description = submitted.fields.getTextInputValue('description');

					const bot_profile = await findProfile({ "userID": interaction.client.user.id });
					const check = bot_profile.connectionDetailArray?.find(detail => detail.siteName === site.trim());
					if (!check){
						await updateData(interaction.client.user, { $push: {
							connectionArray: {
								siteName: site_name,
								domain: site_domain,
								cookie: api_auth,
								testSite: test_site,
								description: description,
							}
						}});
						await submitted.editReply({content: "Details Added!"})
					}
					else{
						await userProfiles.findOneAndUpdate({ "connectionArray.siteName": site_name.trim() }, { $set: {
							"connectionArray.$.domain": domainData,
							"connectionArray.$.cookie": api_auth,
							"connectionArray.$.testSite": testSiteData,
							"connectionArray.$.description": descData,
						}});
						await submitted.editReply({content: "Details Updated!"})
					}
					return;
				}
				try {await interaction.deleteReply();} catch {}
			}
		break;

		case "list_servers":
			{
				try {
					await interaction.deferReply({ephemeral: true});
                    const guilds = await interaction.client.guilds.cache;
                    guilds.forEach(async guild => {
                        const detailsEmbed = new EmbedBuilder();
                        detailsEmbed
                        .setAuthor({ name: `Bot`, iconURL: 'https://cdn.discordapp.com/avatars/969858689869701201/b935252839f0c2ffd500c9010b27b456.png?size=4096' })
                        .setTitle(`Server Details`)
                        .setColor('#00ffff')
                        .addFields(
                            { name: 'Server Name', value: `${guild.name}`, inline: true },
                            { name: 'Server ID', value: `${guild.id}`, inline: true },
                            { name: `Server Member Count`, value: `${guild.memberCount}`, inline: true },
							{ name: `Server Owner`, value: `<@${guild.ownerId}>`, inline: true },
                        )
                        await interaction.member.send({ embeds: [detailsEmbed] });
                    });
                    await interaction.editReply({content: "Details Sent!"})
                }catch (error) {
                    console.error(error);
                    await interaction.editReply({content: `An error occurred.\n\`\`\`${error}\`\`\``});
                }
			}
		break;

		case "server_remove":
			{
				try {
					await interaction.deferReply({ephemeral: true});
                    const serverId = interaction.options.getString('server_id');
                    const guild = await interaction.client.guilds.fetch(serverId);
                    if (!guild) {
                        await interaction.editReply({content: 'Server not found.'});
                    } else {
                        await guild.leave();
                        await interaction.editReply({content: `Removed from ${guild.name}`});
                    }
                } catch (error) {
                    console.error(error);
                    await interaction.editReply({content: `An error occurred.\n\`\`\`${error}\`\`\``});
                }
			}
		break;

		case "bb_db_generate":
			{
				try {
					await interaction.deferReply({ephemeral: true});
                    await bangbros.dbGenerateBase(interaction.client);
                    await interaction.editReply({content: `Finished`});
                } catch (error) {
                    console.error(error);
                    await interaction.editReply({content: `An error occurred.\n\`\`\`${error}\`\`\``});
                }
			}
		break;

		case "sa_db_generate":
			{
				try {
					await interaction.deferReply({ephemeral: true});
                    await interaction.editReply({content: `Starting`});

                    const SAFiles = (await walk(`./essentials/1073966554976354424/accounts/`)).sort();
					for (let index = 0; index < SAFiles.length; index++) {
						
                        const element = JSON.parse(await fs.promises.readFile(SAFiles[index], {encoding: "utf-8"}));
                        let storage = await storageCheck(element);
                        while (parseFloat(storage.usage) > 0) {
                            await deleteAllFiles(element);
                            await wait(500)
                            storage = await storageCheck(element);
                        }
                        const SaProfile = await saSchema.findOne({SaFile: element.private_key_id, guildID: interaction.guild.id});
                        if (!SaProfile) {
                            await saSchema.create({
                                SaFile: element.private_key_id,
                                storageUsed: parseInt(storage.usage),
                                storageLimit: parseInt(storage.limit),
                                storageFree: parseInt(storage.limit) - parseInt(storage.usage),
                                guildID: interaction.guild.id,
								SaJSON: JSON.stringify(element)
                            })
                        }
                        else{
                            await saSchema.findOneAndUpdate({SaFile: element.private_key_id, guildID: interaction.guild.id}, {
                                $set: {
                                    storageUsed: parseInt(storage.usage),
                                    storageLimit: parseInt(storage.limit),
                                    storageFree: parseInt(storage.limit) - parseInt(storage.usage),
                                }
                            });
                        }
						await interaction.editReply({content: `Progress - ${index + 1} out of ${SAFiles.length}.`});
                    }
                } catch (error) {
                    console.error(error);
                    await interaction.editReply({content: `An error occurred.\n\`\`\`${error}\`\`\``});
                }
			}
		break;

		default:
		break;
	}
};

// Export the command and its execute function
export default {
	data: admin_command,
	execute,
	cooldown: 60 * 0.05
};