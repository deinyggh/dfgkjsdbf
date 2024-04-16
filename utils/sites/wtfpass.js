import * as cheerio from "cheerio";
import { findProfile, updateDataCustom } from "../mongodb.js";
import { createResponse } from "../common_functions.js";

async function cookieGen() {
	const authDetails = await findProfile({ "connectionDetailArray.siteName": `wtfpass` });
	if (!authDetails) {
		throw new Error("WTFPass Network DB Details not found!");
	}
	const siteDetails = authDetails.connectionDetailArray.filter(site => site.siteName == "wtfpass");
	const response = await createResponse("https://wtfpass.com/login/", {
		"credentials": "include",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
			"X-Requested-With": "XMLHttpRequest"
		},
		"referrer": "https://wtfpass.com/",
		"body": `action=login&redirect_to=%2F&username=${siteDetails[0].user}&pass=${siteDetails[0].pass}&format=json&mode=async`,
		"method": "POST",
		"mode": "cors"
	});

	const resJson = await response.json();
	if (resJson.status == "success") {
		const cookie = `${response.headers.getSetCookie()[0].replace("path=/; domain=.wtfpass.com", "")}kt_ips=51.81.212.220; kt_tcookie=1; kt_is_visited=1; _ym_uid=1659693290395104473; _ym_d=1659693290; _ym_isad=2`
		const authDetail = await findProfile({ "connectionArray.siteName": `wtfpass` });
		if (authDetail) {
			await updateDataCustom({ "connectionArray.siteName": `wtfpass` }, { $set: {
				"connectionArray.$.cookie": cookie,
				"connectionArray.$.lastCheck" : new Date(),
				"connectionArray.$.timeBetweenChecks" : 1
			}});
		}
		else{
			await updateDataCustom({"userID": authDetails.userID}, { $push: {
				connectionArray: {
					siteName: "wtfpass",
					cookie: cookie,
					lastCheck: new Date(),
					timeBetweenChecks: 1
				}
			}});
		}
	}
};

const Scraper = async (link) => {
	const siteMap = {
		"collegefuckparties": "wtfpass",
		"pickupfuck": "wtfpass",
		"privatesextapes": "wtfpass",
		"hardfuckgirls": "wtfpass",
		"pornweekends": "wtfpass",
		"dollsporn": "wtfpass",
		"publicsexadventures": "wtfpass",
		"pandafuck": "wtfpass",
		"hdmassageporn": "wtfpass",
		"theartporn": "wtfpass",
		"meetsuckandfuck": "wtfpass",
		"porntraveling": "wtfpass"
	};
	let transformedLink = link;
	Object.keys(siteMap).forEach(site => {
		if (link.includes(site)) {
		transformedLink = transformedLink.replace(site, siteMap[site]);
		}
	});
	transformedLink = transformedLink.replace("m.wtfpass.com", "wtfpass.com");
	if (!transformedLink.includes("wtfpass.com")) {
		throw new Error('Enter valid link from WTFPass Sites!');
	}
	const authDetailCheck = await findProfile({ "connectionArray.siteName": `wtfpass` });
	if (!authDetailCheck) {
		await cookieGen();
	}
	else{
		const siteDetails = authDetailCheck.connectionArray.filter(site => site.siteName == "wtfpass");
		if ((new Date() - siteDetails[0].lastCheck)/(1000 * 60) > (parseInt(siteDetails[0].timeBetweenChecks) * 60)) {
			await cookieGen();
		}
	}

	const authDetail = await findProfile({ "connectionArray.siteName": `wtfpass` });
	const siteDetails = authDetail.connectionArray.filter(site => site.siteName == "wtfpass");
	const scene_json = {
		link,
		qualityLinks: [],
		auth: `${siteDetails[0].cookie}`.trim()
	};

	const response = await createResponse(transformedLink, {
		headers: {
			"Cookie": scene_json.auth,
		}
	});
	const body = await response.text();
	const $ = cheerio.load(body);

	scene_json.title = $("h2[class='title big']").text().trim().replace(/[^a-zA-Z0-9 ]/g, "");
	scene_json.site = $("span[class='site']:first").text().trim();
	scene_json.image = `https://cdn.discordapp.com/attachments/970179778017648650/1024010338628272190/unknown.png`;
	const imageData = `${$("script").html()}`.split(/\r?\n/);
	for (let index = 0; index < imageData.length; index++) {
		const element = imageData[index];
		if (element.includes("image0:")) {
			scene_json.image = element.replace("image0:'", "").replace("',", "").trim()
			break;
		}
	}
	$("a[class='input-button ']").each(function (i, e) {
		scene_json.qualityLinks.push(
			{
				quality: $(e).text().trim(),
				activeLink: `${$(e).attr("href")}`.trim(),
				linkType: ".mp4"
			}
		)
	});
	return scene_json;
};


export default {
	Scraper
};