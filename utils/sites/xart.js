import * as cheerio from "cheerio";
import { findProfile } from "../mongodb.js";
import { createResponse } from "../common_functions.js";


const Scraper = async (link) => {
	const transformedLink = link.replace("x-art.com/", "x-art.com/members/")
	if (!transformedLink.includes("x-art.com/members/")) {
		throw new Error('Enter valid link from x-art.com !');
	}
	const authDetail = await findProfile({ "connectionArray.siteName": `xart` });
	if (!authDetail) {
		throw new Error("X-Art Network DB Details not found!");
	}
	const siteDetails = authDetail.connectionArray.filter(site => site.siteName == "xart");
	const scene_json = {
		link,
		qualityLinks: [],
		auth: `${siteDetails[0].cookie}`.trim(),
		site: "X Art"
	};
	let fileType = "";
	try {
		const response = await createResponse(link);
		const body = await response.text();
		const $ = cheerio.load(body);
		if (link.includes("/galleries/")) {
			fileType = ".zip";
			scene_json.image = `${$("div[class] img[alt='thumb']").attr("src")}`;
		}
		else{
			fileType = ".mp4";
			scene_json.image = `${$("div[class='flex-video widescreen'] a[href] img[alt]").attr("src")}`;
		}
	} catch {}
	const response = await createResponse(transformedLink, {
		headers: {
			"Cookie": scene_json.auth
		}
	});
	const body = await response.text();
	const $ = cheerio.load(body);

	scene_json.title = $("div[class='small-12 medium-12 large-12 columns'] h1:first").text().trim().replace(/[^a-zA-Z0-9 ]/g, "");
	$("ul[id='drop-download'] li a").each(function (i, e) {
		scene_json.qualityLinks.push(
			{
				quality: `${$(e).text().trim()}`.split("0x").pop().replace("0 (", "0p (").split("MP4").shift().trim(),
				activeLink: `${$(e).attr("href")}`.trim(),
				linkType: fileType
			}
		)
	});

	return scene_json;
};

export default {
	Scraper,
};