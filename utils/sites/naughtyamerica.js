import * as cheerio from "cheerio";
import { findProfile } from "../mongodb.js";
import { createResponse } from "../common_functions.js";

const Scraper = async (link) => {

    const transformedLink = link.replace("https://www.", "https://").replace("naughtyamerica.com", "members.naughtyamerica.com");
    if (!transformedLink.includes("members.naughtyamerica.com")) {
        throw new Error('Enter valid link from naughtyamerica.com!');
    }
    const authDetail = await findProfile({ "connectionArray.siteName": `naughtyamerica` });
    if (!authDetail) {
        throw new Error('Connection Not Setup!');
    }
    const siteDetails = authDetail.connectionArray.filter(site => site.siteName == "naughtyamerica");
    const scene_json = {
        link,
        site: "Naughty America",
        qualityLinks: [],
        auth: `${siteDetails[0].cookie}`.trim()
    };

    const site = "Naughty America";
    const response = await createResponse(transformedLink, {
		headers: {
			"Cookie": scene_json.auth,
		}
	});
    
    const body = await response.text();
    const $ = cheerio.load(body);
    scene_json.title = $('title').text().trim().replace(/[^a-zA-Z0-9 ]/g, "");
    const streamMenu = $("div[id='stream-options-menu'] table tbody tr td[onclick]");

    if (streamMenu.length == 0) {
        scene_json.image = `https:${$("div[id='vr-player'] dl8-video[id='vr_player']").attr("poster")}`;
        $("div[id='vr-player'] dl8-video[id='vr_player'] source").each(function (i, e) {
            scene_json.qualityLinks.push(
                {
                    quality: `${$(e).attr("quality")}`.replace(/[\\/:*?"<>|]/g, " ").trim(),
                    activeLink: `${$(e).attr("src")}`.trim(),
                    linkType: ".mp4"
                }
            )
        });
        const subsite = `${$("div[class='more-info-left'] p[class='more-info-details'] a[href]:first").text().trim()}`.replace(/[^a-zA-Z0-9 ]/g, "");
        scene_json.site = subsite !== undefined ? `${site} VR - ${subsite}` : `${site} VR`;
    }
    else{
        const qualNames = [];
        const qualLinks = [];
        $("div[id='stream-options-menu'] table tbody tr td[onclick]").each(function (i, e) {
            qualNames.push($(e).text().trim());
            const linkArray = `${$(e).attr("onclick")}`.split(", ");
            for (let linkIndex = 0; linkIndex < linkArray.length; linkIndex++) {
                if (linkArray[linkIndex].includes("naughtycdn.com")) {
                    qualLinks.push(linkArray[linkIndex].replace("'); trackClickInGTM('Video Streaming'", "").replace("'", ""));
                    break;
                }
            }
        });
        const subsite = `${$("div[class='more-info-left'] p[class='more-info-details'] a[href]:first").text().trim()}`.replace(/[^a-zA-Z0-9 ]/g, "");
        scene_json.image = `https:` + `${$("div[class='video-img'] img[title='Click here to play video']").attr("src") ?? "//cdn.discordapp.com/attachments/970179778017648650/1080361594552332359/mwox1000ipad_2_snap-pad750x1000f8f8f8.png"}`;
        scene_json.site = `${site} - ${subsite}`;
        
        for (let index = 0; index < qualNames.length; index++) {
            const searchResult = scene_json.qualityLinks.find((link) => link.quality === qualNames[index]);
            if (!searchResult) {
                scene_json.qualityLinks.push(
                    {
                        quality: qualNames[index],
                        activeLink: qualLinks[index],
                        linkType: ".mp4"
                    }
                )
            }
        }
    }
    //imageset
    try {
        $("div[id='download_photo_sets'] a[class='download-zip']").each(function (i, e) {
            scene_json.qualityLinks.push(
                {
                    quality: `${$(e).text().trim()} Photos`,
                    activeLink: `https:${$(e).attr("href")}`.trim(),
                    linkType: ".zip"
                }
            )
        });
    } catch {}

    return scene_json;
};

export default {
    Scraper,
};