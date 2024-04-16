import * as cheerio from "cheerio";
import { findProfile, updateDataCustom } from "../mongodb.js";
import { createResponse } from "../common_functions.js";

async function cookieGen() {
	const authDetails = await findProfile({ "connectionDetailArray.siteName": `watch4beauty` });
	if (!authDetails) {
		throw new Error("Watch4Beauty DB Details not found!");
	}
	const siteDetails = authDetails.connectionDetailArray.filter(site => site.siteName == "watch4beauty");
	const cookResponse = await createResponse("http://old.watch4beauty.com/");
	const cookie = `${cookResponse.headers.getSetCookie()[0].split(";").shift().trim()}`;
	const response = await createResponse("http://old.watch4beauty.com/", {
			"credentials": "include",
			"headers": {
				"Cookie": cookie,
				"Content-Type": "application/x-www-form-urlencoded",
			},
			"referrer": "http://old.watch4beauty.com/",
			"body": `username=${siteDetails[0].user}&password=${siteDetails[0].pass}&ret=%2F&loginsent=1`,
			"method": "POST",
			"mode": "cors"
		});

	if (response.status == 200) {
		const authDetail = await findProfile({ "connectionArray.siteName": `watch4beauty` });
		if (authDetail) {
			await updateDataCustom({ "connectionArray.siteName": `watch4beauty` }, { $set: {
				"connectionArray.$.cookie": cookie,
				"connectionArray.$.lastCheck" : new Date(),
				"connectionArray.$.timeBetweenChecks" : 1
			}});
		}
		else{
			await updateDataCustom({"userID": authDetails.userID}, { $push: {
				connectionArray: {
					siteName: "watch4beauty",
					cookie: cookie,
					lastCheck: new Date(),
					timeBetweenChecks: 1
				}
			}});
		}
	}
};

const Scraper = async (link) => {

	const transformedLink = link.replace("http://old.watch4beauty.com/issue", "http://old.watch4beauty.com/members/issue")
	if (!transformedLink.includes("http://old.watch4beauty.com/")) {
		throw new Error('Enter valid link from http://old.watch4beauty.com !');
	}
	const authDetailCheck = await findProfile({ "connectionArray.siteName": `watch4beauty` });
	if (!authDetailCheck) {
		await cookieGen();
	}
	else{
		const siteDetails = authDetailCheck.connectionArray.filter(site => site.siteName == "watch4beauty");
		if ((new Date() - siteDetails[0].lastCheck)/(1000 * 60) > (parseInt(siteDetails[0].timeBetweenChecks) * 60)) {
			await cookieGen();
		}
	}

	const authDetail = await findProfile({ "connectionArray.siteName": `watch4beauty` });
	const siteDetails = authDetail.connectionArray.filter(site => site.siteName == "watch4beauty");
	const scene_json = {
		link,
		qualityLinks: [],
		auth: `${siteDetails[0].cookie}`.trim(),
		site: "Watch 4 Beauty"
	};
	const response = await createResponse(transformedLink, {
		headers: {
			"Cookie": scene_json.auth
		}
	});
	const body = await response.text();
	const $ = cheerio.load(body);
	

	scene_json.image = `${$("div[id='middle'] a[class='maincover']").attr("href")}`;
	if (link.includes("/magazine")) {
		scene_json.title = $("div[class='magazine memberaccess'] h1").first().contents().filter(function() {
			return this.type === 'text';
		}).text().trim().replace(/[^a-zA-Z0-9 ]/g, "");
	} else {
		scene_json.title = $("div[class='issuetitle']").first().contents().filter(function() {
			return this.type === 'text';
		}).text().trim().replace(/[^a-zA-Z0-9 ]/g, "");
	}

	$("div[class='column nopadding'] div ul li").each(function (i, e) {
		if (!(`${$(e).text().trim()}`.includes("WMV") || `${$(e).text().trim()}`.includes("Mobile"))) {
			if (!`${$(e).find("a").attr("href")}`.includes("get-access.html")) {
				let fileType = ".mp4";
				if (`${$(e).text().trim()}`.includes("PDF")) {
					fileType = ".pdf";
				} else if (`${$(e).text().trim()}`.includes("photos")) {
					fileType = ".zip";
				}
				scene_json.qualityLinks.push(
					{
						quality: `${$(e).text().trim()}`.replace(",", "."),
						activeLink: `${$(e).find("a").attr("href")}`,
						linkType: fileType
					}
				)
			}
		}
	});

	return scene_json;
};

export default {
	Scraper,
};