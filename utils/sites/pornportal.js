import { capitalizeFirstLetter, createResponse } from "../common_functions.js";
import { findProfile } from "../mongodb.js";

async function portalSceneDetails(query, urltype = "release", offset = "0") {
	const bot_profile = await findProfile({ "connectionDetailArray.siteName": urltype });
	const auth_details = bot_profile.connectionDetailArray.find(detail => detail.siteName === urltype);
	if (!auth_details) {
		throw new Error('Api Credentials not found!');
	}
	let url = "";
  
	switch (urltype) {
		case "release":
			url = `https://site-api.project1service.com/v2/releases/${query}`;
			break;
		case "search":
			const date = new Date();
			date.setDate(date.getDate() + 1);
			const datetime = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;
			url = `https://site-api.project1service.com/v2/releases?dateReleased=%3C${datetime}&orderBy=-relevance&type=scene&limit=5&offset=${offset}&search=${query}`;
			break;
		default:
			break;
	}
  
	const response = await createResponse(url, {
		method: "GET",
		headers: {
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/116.0',
			"authorization": auth_details.user,
			"instance": auth_details.pass
		}
	});
  
	const sceneJson = await response.json();
	return sceneJson;
}

const Scraper = async (link, type) => {
	let scene_json = await portalSceneDetails(link, "release");
	
	if (!scene_json.result) {
		throw new Error("Failed to fetch details!");
	}
  
	if (scene_json.result?.type !== type) {
		if (scene_json.result.type === "movie" || scene_json.result.type === "serie") {
			const childs = scene_json.result.children;
			const sceneIDs = childs
			.filter(child => child.type === "scene")
			.map(child => child.id)
			.join(", ");
			throw new Error(`This is a ${scene_json.result.type} id, please use the following id's - ${sceneIDs}!`);
		} else {
			switch (type) {
			case "scene":
				scene_json = await portalSceneDetails(scene_json.result.parent.id, "release");
				break;
			case "gallery":
				const childs = scene_json.result.type === "trailer" ? scene_json.result.parent.children : scene_json.result.children;
				const galleryID = childs.find(child => child.type === "gallery")?.id;
				scene_json = await portalSceneDetails(galleryID, "release");
				break;
			default:
				break;
			}
		}
	}
	const posterImage = scene_json?.result?.images?.poster[0]?.xx?.url || scene_json?.result?.parent?.images?.poster[0]?.xx?.url;
	scene_json.image = posterImage;
	let site = scene_json.result.brandMeta?.displayName || capitalizeFirstLetter(scene_json.result.brand);
	if (site !== scene_json.result.collections[0]?.name) {
		site = `${site} - ${scene_json.result.collections[0].name}`;
	}
	scene_json.site = site;
	scene_json.title = scene_json.result.title.replace(/[^a-zA-Z0-9 ]/g, "");
	return scene_json;
};

const Search = async (link, offset = "0") => {
	
	const sceneData = await portalSceneDetails(link, "search", offset);
	if (sceneData == "fail") {
		throw new Error('Failed to fetch search results, try again!');
	}
	return sceneData;
};

const extractNumber = async (link) => {
	const match = link.match(/\/(\d+)\//);
	return match ? match[1] : link;
};

export default {
	Scraper,
	Search,
	extractNumber
};