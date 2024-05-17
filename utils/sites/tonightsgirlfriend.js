import * as cheerio from "cheerio";
import { findProfile } from "../mongodb.js";
import { createResponse } from "../common_functions.js";

const Scraper = async (link) => {

    const transformedLink = link.replace("https://www.", "https://").replace("tonightsgirlfriend.com", "members.tonightsgirlfriend.com");
    if (!transformedLink.includes("members.tonightsgirlfriend.com")) {
        throw new Error('Enter valid link from tonightsgirlfriend.com!');
    }
    const authDetail = await findProfile({ "connectionArray.siteName": `tonightsgirlfriend` });
    if (!authDetail) {
        throw new Error('Connection Not Setup!');
    }
    const siteDetails = authDetail.connectionArray.filter(site => site.siteName == "tonightsgirlfriend");
    const scene_json = {
        link,
        site: "Tonights Girlfriend",
        qualityLinks: [],
        auth: `${siteDetails[0].cookie}`.trim()
    };

    {
        const response = await createResponse(link);
        const body = await response.text();
        const $ = cheerio.load(body);
        scene_json.title = $("div[class='info-left'] p[class='breadcrumb']").text().trim().split("/").pop().trim().replace(/[^a-zA-Z0-9 ]/g, "");
        scene_json.image = `https:${$("picture img[class='playcard']").attr("src")}`;
    }
    const response = await createResponse(transformedLink, {
		headers: {
			"Cookie": scene_json.auth,
		}
	});
    const body = await response.text();
    const $ = cheerio.load(body);
    const downloadMenu = $("li[id='download-tab'] ul li a[class='tab-1']");

    if (downloadMenu.length == 0) {
        $("li[id='download-tab'] ul table tbody tr[class] td a[class]").each(function (i, e) {
            scene_json.qualityLinks.push(
                {
                    quality: $(e).text().replace("(Full Movie)", "").replace("*", "").trim(),
                    activeLink: `${$(e).attr("href")}`.trim(),
                    linkType: ".mp4"
                }
            )
        });
    }
    else{
        downloadMenu.each(function (i, e) {
            const name = `${$(e).attr("onclick")}`.includes("5Min") ? `${$(e).text().replace("Download", "").trim()} - 5 Min` : $(e).text().replace("Full Movie", "").trim();
            if (!name.includes("Quicktime")) {
                scene_json.qualityLinks.push(
                    {
                        quality: name,
                        activeLink: $(e).attr("href"),
                        linkType: ".mp4"
                    }
                )
            }
        });
    }
    return scene_json;
};

export default {
    Scraper,
};