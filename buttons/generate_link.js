import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, bold, hyperlink, time } from "discord.js";
import { createResponse, wait } from "../utils/common_functions.js";
import { addTask, findProfile } from "../utils/mongodb.js";
import bangbros from "../utils/sites/bangbros.js";
import metartnetwork from "../utils/sites/metartnetwork.js";
import nadinej from "../utils/sites/nadinej.js";
import naughtyamerica from "../utils/sites/naughtyamerica.js";
import pornportal from "../utils/sites/pornportal.js";
import watch4beauty from "../utils/sites/watch4beauty.js";
import wtfpass from "../utils/sites/wtfpass.js";
import xart from "../utils/sites/xart.js";
import { start_queue } from "../utils/task_queue.js";

const user_check = async (interaction) => {
	const user_profile = await findProfile({userID: interaction.user.id});

	if (!user_profile) {
		throw new Error("User profile not found. Set any Host first!");
	}
	const { userHostDetails, dailyUseCount } = user_profile;

	if (!userHostDetails?.defaultHost) {
		throw new Error("User has not set any Host!");
	}
	await host_detail_check(userHostDetails);

	const bot_profile = await findProfile({userID: interaction.client.user.id});
	const isPremium = bot_profile.additional_details?.botBoosterPremium === true && interaction.member.premiumSince;
	const isPremiumUser = user_profile.userPremiumExpire > new Date();

	if (!isPremium && !isPremiumUser) {
		switch (userHostDetails.defaultHost) {
			case "G-Drive Shared Drive":
			case "G-Drive Personal Folder":
			case "G-Drive Public SA":
			case "Mega.nz":
				if (dailyUseCount.givelink >= bot_profile.additional_details?.botDailyLimit?.givelink) {
					throw new Error("User has hit Daily Request Limit for this host!");
				}
			break;

			case "Direct Link":
				if (dailyUseCount.generate >= bot_profile.additional_details?.botDailyLimit?.generate) {
					throw new Error("User has hit Daily Request Limit for this host!");
				}
			break;

			default:
			break;
		}
	}
	return user_profile.userHostDetails;
};

const host_detail_check = async (userHostDetails) => {
	switch (userHostDetails.defaultHost) {
		case "G-Drive Shared Drive":
			if (!userHostDetails.gdrive_shared) {
				throw new Error("User has not set Shared Drive Folder ID!");
			}
			break;

		case "G-Drive Personal Folder":
			if (!userHostDetails.gdrive_personal) {
				throw new Error("User has not set Personal Drive Folder ID!");
			}
			if (!userHostDetails.gdrive_personal_sa) {
				throw new Error("User has not set Personal Service Account!");
			}
			break;

		case "G-Drive Public SA":
			if (!userHostDetails.gdrive_personal) {
				throw new Error("User has not set Personal Drive Folder ID!");
			}
			break;

		case "Mega.nz":
			if (!(userHostDetails.mega?.user && userHostDetails.mega?.pass)) {
				throw new Error("User has not set Mega.nz Credentials!");
			}
			break;

		default:
			break;
	}
};

const valid_network_check = async (link, host = "Direct Link") => {
	const site_map_dl = {
		//wtfpass
		"collegefuckparties.com": "wtfpass",
		"wtfpass.com": "wtfpass",
		"pickupfuck.com": "wtfpass",
		"privatesextapes.com": "wtfpass",
		"hardfuckgirls.com": "wtfpass",
		"pornweekends.com": "wtfpass",
		"dollsporn.com": "wtfpass",
		"publicsexadventures.com": "wtfpass",
		"pandafuck.com": "wtfpass",
		"hdmassageporn.com": "wtfpass",
		"theartporn.com": "wtfpass",
		"meetsuckandfuck.com": "wtfpass",
		"porntraveling.com": "wtfpass",
		//bangbros
		"bangbros.com": "bangbros",
		"bangbrosbot.com": "bangbrosbot",
		"sexselector.com": "bbnetwork",
		"miakhalifa.com": "bbnetwork",
		//w4b
		"old.watch4beauty.com": "watch4beauty",
		//xart
		"x-art.com": "xart",
		//ajp
		"18tokyo": "ajp_network",
		"alljapanesepass": "ajp_network",
		"analnippon": "ajp_network",
		"bigtitstokyo": "ajp_network",
		"bukkakenow": "ajp_network",
		"japaneseflashers": "ajp_network",
		"japaneseslurp": "ajp_network",
		"jcosplay": "ajp_network",
		"jpmilfs": "ajp_network",
		"jpnurse": "ajp_network",
		"jpshavers": "ajp_network",
		"jpteacher": "ajp_network",
		"jschoolgirls": "ajp_network",
		"myracequeens": "ajp_network",
		"ocreampies": "ajp_network",
		"officesexjp": "ajp_network",
		"outdoorjp": "ajp_network",
		"povjp": "ajp_network",
		"tokyobang": "ajp_network",
		//aussiepov
		"aussiepov.com": "aussiepov",
		//aussieass
		"aussieass.com": "aussieass",
		//metartnetwork
		"www.metart.com": "metartnetwork",
		"www.metartx.com": "metartnetwork",
		"www.sexart.com": "metartnetwork",
		"www.thelifeerotic.com": "metartnetwork",
		"www.vivthomas.com": "metartnetwork",
		"www.alsscan.com": "metartnetwork",
		"www.errotica-archives.com": "metartnetwork",
		"www.eternaldesire.com": "metartnetwork",
		"www.rylskyart.com": "metartnetwork",
		"www.goddessnudes.com": "metartnetwork",
		"www.eroticbeauty.com": "metartnetwork",
		"www.stunning18.com": "metartnetwork",
		"www.domai.com": "metartnetwork",
	};
	const site_map_ndl = {
		//bangbros
		"bangbrosbot.com": "bangbrosbot",
		"bangbros.com": "pornportal",
		//naughtyamerica
		"naughtyamerica.com": "naughtyamerica",
		//nadine-j.de
		"nadine-j.de": "nadinej",
		//pure_xxx
		"pure-xxx.com": "pure_xxx",
		//primalfetishnetwork
		"primalfetishnetwork.com": "primalfetishnetwork",
		//pornportal
		"babes.com": "pornportal",
		"biempire.com": "pornportal",
		"brazzers.com": "pornportal",
		"deviante.com": "pornportal",
		"digitalplayground.com": "pornportal",
		"dilfed.com": "pornportal",
		"erito.com": "pornportal",
		"fakehub.com": "pornportal",
		"hentaipros.com": "pornportal",
		"metrohd.com": "pornportal",
		"milehighmedia.com": "pornportal",
		"sweetheartvideo.com": "pornportal",
		"sweetsinner.com": "pornportal",
		"sweetsinner.com": "pornportal",
		"milfed.com": "pornportal",
		"mofos.com": "pornportal",
		"propertysex.com": "pornportal",
		"realitykings.com": "pornportal",
		"sexyhub.com": "pornportal",
		"squirted.com": "pornportal",
		"stevenshame.com": "pornportal",
		"trueamateurs.com": "pornportal",
		"twistys.com": "pornportal",
		"vrtemptation.com": "pornportal",
		"whynotbi.com": "pornportal",
		"transharder.com": "pornportal",
		"transangels.com": "pornportal",
		"transsensual.com": "pornportal",
		"bromo.com": "pornportal",
		"czechhunter.com": "pornportal",
		"debtdandy.com": "pornportal",
		"dirtyscout.com": "pornportal",
		"iconmale.com": "pornportal",
		"johnnyrapid.com": "pornportal",
		"matthewcamp.com": "pornportal",
		"men.com": "pornportal",
		"noirmale.com": "pornportal",
		"realitydudes.com": "pornportal",
		"seancody.com": "pornportal",
	};
	const network = host == "Direct Link" ? Object.keys(site_map_dl).find(site => link.includes(site)) ?? null : Object.keys({...site_map_dl, ...site_map_ndl}).find(site => link.includes(site)) ?? null;
	if (!network) {
		if (host === "Direct Link") {
			const test_network = Object.keys(site_map_ndl).find(site => link.includes(site)) ?? null;
			if(test_network){
				throw new Error("Site not Supported for Direct Link, but can be Bypassed for other hosts!")
			}
		}
		throw new Error("Site not Supported by Bot!")
	}
	else{
		const site_map = host == "Direct Link" ? site_map_dl : {...site_map_dl, ...site_map_ndl};
		return site_map[network];
	}
};

const generate_link_details = async (url, host = "Direct Link", network = "common") => {
	const link_network = network == "common" ? await valid_network_check(url, host) : network;
	let scene_json = {};
	switch (link_network) {
		case "pornportal":
			scene_json = await pornportal.Scraper(await pornportal.extractNumber(url));
		break;
		case "watch4beauty":
			scene_json = await watch4beauty.Scraper(url);
		break;
		case "wtfpass":
			scene_json = await wtfpass.Scraper(url);
		break;
		case "xart":
			scene_json = await xart.Scraper(url);
		break;
		case "metartnetwork":
			scene_json = await metartnetwork.Scraper(url);
		break;
		case "naughtyamerica":
			scene_json = await naughtyamerica.Scraper(url);
		break;
		case "nadinej":
			scene_json = await nadinej.Scraper(url);
		break;
		case "bangbros":
		case "bangbrosbot":
		case "bbnetwork":
			scene_json = await bangbros.Scraper(url, link_network);
		break;

		default:
			{
				throw new Error('Scraper Not Initialized !');
			}
			break;
	}
	scene_json.link_network = link_network;
	return scene_json;
};

const quality_selection = async (interaction, scene_json) => {
	const quality_embed = new EmbedBuilder()
	.setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ format: "png" , size: 4096 , dynamic: false})})
	.setColor("Random")
	.setTitle(scene_json.site)
	.setDescription(bold(scene_json.title))
	.setThumbnail('https://i.imgur.com/GzYrhYK.gif')
	.setFooter({text: 'Stay Horny, Spread Horny!', iconURL: 'https://i.imgur.com/htKfpMj.jpeg'})
	.setTimestamp();

	const rowVid = new ActionRowBuilder()
	const rowVid2 = new ActionRowBuilder()
	const rowPic = new ActionRowBuilder()
	const rowOth = new ActionRowBuilder()

	if (scene_json.result) {
		const links = scene_json.result.videos?.full?.files;
		for (const quality in links) {
			const qualityObject = links[quality];
			if (parseInt(qualityObject.sizeBytes) > 2) {
				const row = rowVid.components.length < 5 ? rowVid : rowVid2;
				row.addComponents(
				new ButtonBuilder()
					.setCustomId(qualityObject.format)
					.setLabel(`${qualityObject.format} (${parseInt(parseInt(qualityObject.sizeBytes)/(1024*1024))} MB)`)
					.setStyle(ButtonStyle.Primary)
					.setEmoji("🎥")
				);
			}
		}
		if (rowVid.components.length === 0) {
			throw new Error('No active links found currently!');
		}
	}
	else{
		for (let index = 0; index < scene_json.qualityLinks.length; index++) {
			const element = scene_json.qualityLinks[index];
			switch (element.linkType) {
			case ".mp4":
				const row = rowVid.components.length < 5 ? rowVid : rowVid2;
				row.addComponents(
				new ButtonBuilder()
					.setCustomId(element.quality.trim())
					.setLabel(element.quality.trim())
					.setStyle(ButtonStyle.Primary)
					.setEmoji("🎥")
				);
				break;

			case ".zip":
				rowPic.addComponents(
				new ButtonBuilder()
					.setCustomId(element.quality.trim())
					.setLabel(element.quality.trim())
					.setStyle(ButtonStyle.Success)
					.setEmoji("📷")
				);
				break;

			default:
				rowOth.addComponents(
				new ButtonBuilder()
					.setCustomId(element.quality.trim())
					.setLabel(element.quality.trim())
					.setStyle(ButtonStyle.Danger)
					.setEmoji("🖼")
				);
				break;
			}
		}
	}

	const rowArray = [rowVid, rowVid2, rowOth, rowPic].filter(row => row.components.length !== 0);
	const response = await interaction.editReply({content: `Select Option in ${time(new Date(Date.now() + 15000), "R")}`, embeds: [quality_embed], components: rowArray, fetchReply: true });
	const collectorFilter = i => i.user.id === interaction.user.id;
	const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, componentType: ComponentType.Button, max: 1, time: 15 * 1000 });
	await confirmation.update({content: `Selected Quality ${confirmation.customId}`, components: [], embeds: []});
	return confirmation.customId;
};

const link_finder = async (scene_json) => {
	if (scene_json.result) {
		switch (scene_json.result?.type) {
			case "scene":
				scene_json.download_link = scene_json.result?.videos?.full?.files?.[scene_json.quality]?.urls?.download ?? scene_json.result?.videos?.full?.files?.[scene_json.quality]?.urls?.view;
				scene_json.file_ext = ".mp4";
				break;
			case "gallery":
				const galleries = scene_json.result.galleries
				for (let index = 0; index < galleries.length; index++) {
					const child = galleries[index];
					if (child.format == "download"){
						scene_json.download_link = child.urls?.download ?? child.urls?.view;
					}
				}
				scene_json.file_ext = ".zip";
				break;
			default:
				break;
		}

	} else {
		const searchResult = scene_json.qualityLinks.find((link) => link.quality.trim() == `${scene_json.quality}`.trim());
		if (searchResult) {
			scene_json.download_link = searchResult.activeLink;
			scene_json.file_ext = searchResult.linkType;
		}
	}
	return scene_json;
};

const final_embed_generation = async (interaction, scene_json) => {
	function isURL(str) {
		try {
			new URL(str);
			return true;
		} catch {
			return false;
		}
	}
	const isLinkURL = isURL(scene_json.link);
	const linkName = isLinkURL ? 'Scene Link' : 'Scene ID';
	const linkValue = isLinkURL ? hyperlink('Click Here', scene_json.link) : scene_json.link;
	const final_embed = new EmbedBuilder()
	.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ format: "png" , size: 4096 , dynamic: false})})
	.setColor("Random")
	.setTitle(scene_json.site)
	.setDescription(scene_json.title)
	.setTimestamp()
	.setFooter({text: 'Stay Horny, Spread Horny!', iconURL: 'https://i.imgur.com/htKfpMj.jpeg'})
	.setImage(scene_json.image)
	.addFields(
		{ name: linkName, value: linkValue, inline: true },
		{ name: 'Quality', value: scene_json.quality, inline: true }
	);
	return final_embed;
};

const generate_link = async (interaction) => {
	try {
		const url = new TextInputBuilder()
			.setCustomId('url')
			.setLabel("Enter link")
			.setStyle(TextInputStyle.Short)
			.setPlaceholder("Enter Link!")
			.setRequired(true);

		const inputModal = new ModalBuilder()
			.setCustomId(`linkInputModal`)
			.setTitle(`Link Generator`)
			.setComponents(
				new ActionRowBuilder().addComponents(url),
			)
		;
		await interaction.showModal(inputModal);
		const submitted = await interaction.awaitModalSubmit({ time: 1000 * 60 * 5,
			filter: i => i.user.id === interaction.user.id,
		}).catch(error => {
			console.error(error)
			return null;
		})

		if (submitted) {
			const url = submitted.fields.getTextInputValue("url").trim();
			await submitted.deferReply({ephemeral: true});
			try {
				const user_host_details = await user_check(interaction);
				const scene_data = await generate_link_details(url, user_host_details.defaultHost, interaction.customId);
				scene_data.quality = await quality_selection(submitted, scene_data);
				scene_data.link = url;
				const final_embed = await final_embed_generation(interaction, scene_data);
				const scene_json = await link_finder(scene_data);
				const bot_profile = await findProfile({userID: interaction.client.user.id});

				if (user_host_details.defaultHost !== "Direct Link") {
					const logsChannel = await interaction.client.channels.fetch(bot_profile.additional_details?.botChannelID);
					const message = await logsChannel.send({embeds: [
						new EmbedBuilder()
						.setColor("DarkGold")
						.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ format: "png" , size: 4096 , dynamic: false})})
						.setTitle(scene_json.site)
						.setDescription(scene_json.title)
						.setTimestamp()
						.setFooter({text: 'Stay Horny, Spread Horny!', iconURL: 'https://i.imgur.com/htKfpMj.jpeg'})
						.addFields(
							{ name: "Status", value: "Queued", inline: true },
							{ name: "Host", value: user_host_details.defaultHost, inline: true },
						)
					]});

					scene_json.file_name = scene_data.link_network == "pornportal" ? `${scene_json.site} - ${scene_json.title} - ${scene_json["result"]["id"]} - ${scene_data.quality} - ${interaction.id}` : `${scene_json.site} - ${scene_json.title} - ${scene_data.quality.replace("zip ", "")} - ${interaction.id}`;
					scene_json.file_name = `${scene_json.file_name}${scene_json.file_ext}`;
					scene_json.user_host = user_host_details.defaultHost;
					try {
						scene_json.final_embed = final_embed.toJSON();
					} catch{}
					await addTask(interaction.user, message.id, JSON.stringify(scene_json));
					await submitted.editReply({content: `Task Added -> ${message.url}`, embeds: [final_embed]});
					await wait(1000 * 60);
					start_queue(interaction.client);
				}
				else{
					let new_headers = {};
					switch (scene_data.link_network) {
						case 'pure_xxx':
						case 'primalfetishnetwork':
						case 'nadinej':
						case "metartnetwork":
							new_headers = {
								'Authorization': `Basic ${scene_data.auth}`
							}
						break;

						case 'atkgirlfriends':
                        case 'xart':
                        case 'ajp_network':
						case 'watch4beautyr':
                        case 'wtfpass':
							new_headers = {
								"Cookie": `${scene_data.auth}`
							}
						break;

						default:
							break;
					}
					const check_response = await createResponse(scene_json.download_link, {headers: new_headers});
					if (check_response.redirected) {
						scene_json.download_link = check_response.url;
					}

					const link_row = new ActionRowBuilder();
					link_row.addComponents(
						new ButtonBuilder()
						.setStyle(ButtonStyle.Link)
						.setLabel("Link")
						.setURL(scene_json.download_link)
					)
					await interaction.member.send({embeds: [final_embed], components: [link_row]});
					await submitted.editReply({content: ``, embeds: [final_embed]});
					const logsChannel = await interaction.client.channels.fetch(bot_profile.additional_details?.botChannelID);
					await logsChannel.send({embeds: [final_embed]});

				}
				return;
			} catch (error) {
				console.log(error);
				await submitted.editReply({ content: ``, components: [], embeds: [
					new EmbedBuilder()
					.setColor("DarkRed")
					.setDescription(`${error}`)
				] });
				return;
			}
		}

	} catch (error) {
		console.log(error);
		try{
			await interaction.reply({ content: 'Check logs for error! Please try again!'});
		}
		catch{}
		return;
	}
}

export { final_embed_generation, generate_link, generate_link_details, host_detail_check, link_finder };
