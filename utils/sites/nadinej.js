import * as cheerio from "cheerio";
import { createResponse } from "../common_functions.js";
import { findProfile } from "../mongodb.js";

const Scraper = async (link) => {
	const url = link.includes("https://nadine-j.de/nadine/photosets/") || link.includes("https://nadine-j.de/model/") ? `https://nadine-j.de/member/photoset/${link.split("/").pop()}` : link;

	if (!url.includes("https://nadine-j.de/member")) {
		throw new Error('Enter valid link from nadine-j.de!');
	}
	const authDetails = await findProfile({ "connectionDetailArray.siteName": `nadine` });
	if (!authDetails) {
		throw new Error(`${domain} creds not found!`);
	}
	const siteDetails = authDetails.connectionDetailArray.filter(site => site.siteName == `nadine`);
	const scene_json = {
		link,
		site: 'Nadine-J',
		qualityLinks: [],
		auth: `${Buffer.from(`${siteDetails[0].user}:${siteDetails[0].pass}`).toString("base64")}`
	};

	const response = await createResponse(url, {
		headers: {
		  'Authorization': `Basic ${scene_json.auth}`
		}
	});

	const body = await response.text();
	const $ = cheerio.load(body);

	if (url.includes('/photoset/')) {
		scene_json.title = $('div[class=row] div[class] h1[class]').text().trim();
		scene_json.date = $("div[class=row] div[class] h5[class='text-left date']").text().trim();
		scene_json.actors = $("div[class=row] div[class] h2[class='panel-title']").text().trim();
		scene_json.image = `https://nadine-j.de${$('div[class=row] div img[src]').attr('src')}`;
	} else {
		scene_json.title = $('div[class=col-md-6] h1').text().trim();
		scene_json.date = $('div[class=panel-body] h5').text().trim();
		scene_json.actors = $('div[class=col-md-6] h2').text().trim();
		scene_json.image = `https://nadine-j.de${$('div[class=col-md-6] a img[src]').attr('src')}`;
	}
	$('div[class=video-download]').each((i, e) => {
		if (
			(url.includes('/video/') && $(e).find('strong').text().includes('HD ')) ||
			url.includes('/photoset/')
		) {
			const fileType = url.includes('/photoset/') ? '.zip' : '.mp4';
			scene_json.qualityLinks.push(
				{
					quality: $(e).find('strong').text().trim().replace("zip ", ""),
					activeLink: `https://nadine-j.de${$(e).find('a').attr('href')}`.trim(),
					linkType: fileType
				}
			)
		}
	});

	return scene_json;
};

export default {
	Scraper,
};