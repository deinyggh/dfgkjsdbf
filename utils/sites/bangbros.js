import * as cheerio from "cheerio";
import { findProfile } from "../mongodb.js";
import { createResponse, wait } from "../common_functions.js";

import fs from "node:fs";
import pornportal from "./pornportal.js";

const Scraper = async (link, network) => {
	const scene_json = {
		link,
		qualityLinks: [],
	};
	async function looper(array, transformedLink) {
		try {
			let $;
			let index = 0;
			while (index < array.length && scene_json.qualityLinks.length == 0) {
				const element = array[index];
				await wait(2000);
				const response = await createResponse(`https://members.${element.domain}.com${transformedLink}`, {
					headers: {
						"cookie": `${element.cookie}`
					},
				});
				const body = await response.text();
				$ = cheerio.load(body);
				// console.log(response.url);
				if (response.url.includes("/library")) {
					break;
				}
				$(`div[class="vdob-lft clearfix"] div div[class='dropM'] ul li a`).each(function (i, e) {
					if (`${$(e).attr("href")}`.includes(".mp4")) {
						scene_json.qualityLinks.push(
							{
								quality: $(e).text().trim(),
								activeLink: `${$(e).attr("href")}`.trim(),
								linkType: ".mp4"
							}
						)
					}
				});
				scene_json.auth = element.cookie;
				index++;
			}
			return {$};
		} catch (error) {
			// console.log(error);
		}
	}
	const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
	let transformedLink = link;
	if (network === 'bangbros') {
		if (!transformedLink.includes("bangbros.com/video")) {
			throw new Error('Enter valid scene link from bangbros.com!');
		}
		transformedLink = `/product/1/movie/${(await pornportal.Scraper((await pornportal.extractNumber(transformedLink)), "scene"))['result']['spartanId']}`
	} else {
		transformedLink = await pornportal.extractNumber(link);
		const database = JSON.parse(await fs.promises.readFile(`./essentials/bbjs.json`, {encoding: "utf-8"}))
		const results = database.filter(result => result.code.toLowerCase() === link.toLowerCase() || result.id == transformedLink);
		if (results.length === 0) {
			throw new Error('Scene with this ID not found!');
		} else {
			transformedLink = results[0].url;
			scene_json.title = results[0].title.replace(/[^a-zA-Z0-9 ]/g, "");
			scene_json.image = results[0].image;
			scene_json.site = `Bangbros - ${results[0].site.name.replace(/[\\/:*?"<>|]/g, "")}`;
			scene_json.link = results[0].code;
		}
	}
	let $;
	try {
		const bot_profile = await findProfile({ 'connectionArray.siteName': "bangbros1" });
		if (bot_profile) {
			const query = network == "bangbros" ? "bangbros" : "bangbros network"
			const bangbrosArray = bot_profile.connectionArray.filter(entry => (entry.description?.includes(query) && entry.description?.includes("4k")));
			const result = await looper(bangbrosArray, transformedLink);
			if (scene_json.qualityLinks.length == 0) {
				const bangbrosArray = bot_profile.connectionArray.filter(entry => (entry.description?.includes(query) && entry.description?.includes("1080p")));
				const result = await looper(bangbrosArray, transformedLink);
				$ = result.$;
			}
			else{
				$ = result.$;
			}
		}
		else{
			throw new Error('DB connection Issue!');
		}
	} catch (error) {
		console.error(error);
	}
	if (network === 'bangbros') {
		scene_json.title = $("div div[class='vdo-hdd1']").text().trim().replace(/[^a-zA-Z0-9 ]/g, "");
		scene_json.site = "Bangbros";
		$(`div[style] div span a[href]`).each(function (i, e) {
			if (`${$(e).attr("href")}`.includes("/product/1/site/")) {
				scene_json.site = `Bangbros - ${$(e).text().trim()}`;
			}
		});
		scene_json.image = $("div video[poster]:first").attr("poster");
		try {
			const response = await createResponse(scene_json.image);
			if (response.status !== 200) {
					scene_json.image = "https://cdn.discordapp.com/attachments/970179778017648650/1077082257413648464/image.png";
			}
		} catch (error) {}
	}

	$(`div[class="vdob-lft clearfix"] div[class='ech-vdob'] a`).each(function (i, e) {
		if ($(e).text().trim().includes("Photos.zip")) {
			scene_json.qualityLinks.push(
				{
					quality: $(e).text().trim().replace(".zip", ""),
					activeLink: `${$(e).attr("href")}`.trim(),
					linkType: ".zip"
				}
			)
		}
	});
	if (scene_json.qualityLinks.length == 0) {
		throw new Error('No Link available currently!');
	}
	return scene_json;
};

const dbGenerateBase = async (client) => {
	let siteArray = [];
	async function looper(array) {
		try {
			let $;
			let index = 0;
			while (index < array.length && siteArray.length == 0) {
				const element = array[index];
				await wait(2000);
				const response = await createResponse(`https://members.${element.domain}.com/library`, {
					headers: {
						"cookie": `${element.cookie}`
					},
				});
				const body = await response.text();
				$ = cheerio.load(body);
				$(`div[class="site-gallery"] a[class='site']`).each(function (i, e) {
					if (`${$(e).attr("href")}`.includes("/product/") && `${$(e).attr("href")}` != "/product/1"){
						siteArray.push(`${$(e).attr("href")}`.trim())
					}
				});

				$(`div[class="site-gallery unlocked"] a[class='site']`).each(function (i, e) {
					if (`${$(e).attr("href")}`.includes("/product/") && `${$(e).attr("href")}` != "/product/1"){
						siteArray.push(`${$(e).attr("href")}`.trim())
					}
				});
				index++;
			}
			index = index - 1;
			return {index};
		} catch (error) {
			console.log(error);
		}
	}
	async function bbScrap($, array) {
		try {
			$("div[class = 'thmbHldr-in clearfix'] div[data-shoot]").each(function (i, e) {
				const dataJson = JSON.parse(`${$(e).attr("data-shoot")}`)
				array.push(dataJson)
			});
		} catch (error) {
			console.log(error);
		}
	}
	try {
		const bot_profile = await findProfile({ 'connectionArray.siteName': "bangbros1" });
		if (!bot_profile) {
			throw new Error('Bot Profile not found!');
		}
		const logsChannel = await client.channels.fetch(bot_profile.additional_details?.botChannelID);
		const msg = await logsChannel.send(`Starting BB DB Update!`);
		const bangbrosArray = bot_profile.connectionArray.filter(entry => (entry.description?.includes("bangbros ") && entry.description?.includes("dbgenerate")));
		const result = await looper(bangbrosArray);
		const detailsElement = bangbrosArray[result.index];
		await msg.edit({ content: `Total Sites - ${siteArray.length}`});
		const oldDB = JSON.parse(await fs.promises.readFile(`./essentials/bbjs.json`, {encoding: "utf-8"}));

		let mainArray = [];
		for (let site = 0; site < siteArray.length; site++) {
			const element = siteArray[site];
			console.log(`Scraping Bangbros DB - ${element}`);
			await msg.edit({ content: `Scraping Bangbros DB ${site + 1} / ${siteArray.length} - ${element}`});
			try{
				const baseURL = `https://members.${detailsElement.domain}.com${element}/videos`
				const response = await createResponse(baseURL, {
					headers: {
						"cookie": detailsElement.cookie
					},
				});
				
				await wait(5000);
				const body = await response.text();
				const $ = cheerio.load(body);
				const endPage = $("div[class='pageCent'] a[class='nrBtn ech-btn ech-vdob-dc']:last").attr("href") ? parseInt($("div[class='pageCent'] a[class='nrBtn ech-btn ech-vdob-dc']:last").attr("href").split("/").pop().trim()) : 1;
				await bbScrap($, mainArray);

				for (let index = 2; index <= endPage; index++) {
					const url = `${baseURL}/latest/${index}`
					const response = await createResponse(url, {
						headers: {
							"cookie": detailsElement.cookie
						},
					});
					await wait(10000);
					const body = await response.text();
					const $ = cheerio.load(body);
					await bbScrap($, mainArray);
				}
			}
			catch (error){
				console.error(error);
			}
		}
		await fs.promises.writeFile(`./essentials/bbjs.json`, `${JSON.stringify(mainArray, null, "\t")}`, {encoding: "utf-8"});
		const newDB = JSON.parse(await fs.promises.readFile(`./essentials/bbjs.json`, {encoding: "utf-8"}));
		let detailString = "Stats\n";

		for (let site = 0; site < siteArray.length; site++){
			const element = siteArray[site];
			const oldResults = oldDB.filter(result => result.url.includes(element));
			const newResults = newDB.filter(result => result.url.includes(element));
			if (newResults.length !== oldResults.length) {
				detailString = `${detailString}${oldResults[0].site.name} - ${newResults.length - oldResults.length}\n`;
			}
		}
		mainArray = [];
		siteArray = [];
		await msg.edit({ content: `Scraping Bangbros DB Finished`});
		await logsChannel.send(detailString);
	} catch (error) {
		console.log(error);
	}
};

export default {
	Scraper,
	dbGenerateBase
};