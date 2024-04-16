import * as cheerio from "cheerio";
import { findProfile } from "../mongodb.js";
import { capitalizeFirstLetter, createResponse } from "../common_functions.js";

const Scraper = async (link) => {
    const networkDomain = `members.nvgart.com`;
    const siteMap = {
        "www.metart.com": networkDomain,
        "www.metartx.com": networkDomain,
        "www.sexart.com": networkDomain,
        "www.thelifeerotic.com": networkDomain,
        "www.vivthomas.com": networkDomain,
        "www.straplez.com": networkDomain,
        "www.alsscan.com": networkDomain,
        "www.errotica-archives.com": networkDomain,
        "www.eternaldesire.com": networkDomain,
        "www.rylskyart.com": networkDomain,
        "www.goddessnudes.com": networkDomain,
        "www.eroticbeauty.com": networkDomain,
        "www.stunning18.com": networkDomain,
        "www.domai.com": networkDomain,
    };
    let transformedLink = link;
    Object.keys(siteMap).forEach(site => {
        if (link.includes(site)) {
        transformedLink = transformedLink.replace(site, siteMap[site]);
        }
    });

    const domain = link.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/)[1];
    const authDetails = await findProfile({ 'connectionDetailArray.siteName': domain.replace('.com', '') });
  
    if (!authDetails) {
      throw new Error(`${domain} creds not found!`);
    }
  
    const siteDetails = authDetails.connectionDetailArray.find(site => site.siteName === domain.replace('.com', ''));
    const scene_json = {
        link,
        site: await capitalizeFirstLetter(domain.replace('.com', '')),
        qualityLinks: [],
        auth: Buffer.from(`${siteDetails.user}:${siteDetails.pass}`).toString('base64')
    };
  
    const response = await createResponse(transformedLink, {
      headers: {
        'Authorization': `Basic ${scene_json.auth}`
      }
    });
  
    const body = await response.text();
    const $ = cheerio.load(body);
    scene_json.title = $('div[class="options_title"]:first').text().replace(/[^a-zA-Z0-9 ]/g, '').trim();
    scene_json.image = $("div[class='photos_left'] a img").attr("src")?.replace("https://assets.metartnetwork.com/cams/thumb.php?width=141&thumb=", "");
  
    if (link.includes('/movie/')) {
      $('ul[class="downloading_options_list"] li a').each(function (i, e) {
        const element = $(e).text().trim().replace('HD', 'HD ').replace('SD', 'SD ').replace('mb', ' MB');
        if (!(element.includes('WMV') || element.includes('DivX'))) {
          scene_json.qualityLinks.push({
            quality: element,
            activeLink: $(e).attr('href'),
            linkType: '.mp4'
          });
        }
      });
    } else if (link.includes('/gallery/')) {
      $('div[class="gallery_overview gallery_overview_top"] div div[class="gallery_zip gallery_zip_download"] ul li a').each(function (i, e) {
        scene_json.qualityLinks.push({
          quality: $(e).text().trim(),
          activeLink: $(e).attr('href'),
          linkType: '.zip'
        });
      });
    }
  
    return scene_json;
};

export default {
    Scraper,
};

// let link = "";
// if (link2.includes("metart.com")) {
//     link = link2.replace("www.metart.com", "members.metartvip.com")
//     sceneData.auth = "am9ubnljdW06ZmVuZGVyMTM=";
//     sceneData.auth = "ZG1hbmFiZTowNzI1MDUyNA==";
// } else if (link2.includes("sexart.com")) {
//     link = link2.replace("www.sexart.com", "members.metartvip.com")
//     sceneData.auth = "YzAzMTA0NTpwb2xvNzU=";
//     sceneData.auth = "am9ubnljdW06ZmVuZGVyMTM=";
//     sceneData.auth = "YmdhdWtlbDpTYXJhMTIxOQ==";
// } else if (link2.includes("thelifeerotic.com")) {
//     link = link2.replace("www.thelifeerotic.com", "members.metartvip.com")
//     sceneData.auth = "YzAzMTA0NTpwb2xvNzU=";
// } else if (link2.includes("metartx.com")) {
//     link = link2.replace("www.metartx.com", "members.metartvip.com")
//     sceneData.auth = "aGFyaWI1NTU6MzNoazVkNng=";
// } else if (link2.includes("stunning18.com")) {
//         link = link2.replace("www.stunning18.com", "members.metartvip.com")
//         metartauth = "ZXVyb2NpdHk6YnIxMDFoaA==";
// } else if (link2.includes("vivthomas.com")) {
//     link = link2.replace("www.vivthomas.com", "members.metartvip.com")
//     sceneData.auth = "YzAzMTA0NTpwb2xvNzU=";
//     sceneData.auth = "Y3NsOGVyOnN1bW1lcjEx";
// } else if (link2.includes("errotica-archives.com")) {
//     link = link2.replace("www.errotica-archives.com", "members.metartvip.com")
//     sceneData.auth = "ZG1hbmFiZTowNzI1MDUyNA==";
// } else if (link2.includes("straplez.com")) {
//         link = link2.replace("www.straplez.com", "members.metartvip.com")
//         metartauth = "c2FkbWFua2tAaG90bWFpbC5jb206amFkZTEyMzQ=";
// } else if (link2.includes("alsscan.com")) {
//     link = link2.replace("www.alsscan.com", "members.metartvip.com")
//     metartauth = "amFrZW45OWNhbjptdWNoOTk=";
//     sceneData.auth = "bXIxNDYwMDM6YnI0MjMwMDE=";
//     sceneData.auth = "WklBRE1BNjc6SElaSUFETUE=";
// } else if (link2.includes("eroticbeauty.com")) {
//     link = link2.replace("www.eroticbeauty.com", "members.metartvip.com")
//         metartauth = "YmlnZ3lwODA4OjgwOHdpemFy";
// } else if (link2.includes("domai.com")) {
//     link = link2.replace("www.domai.com", "members.metartvip.com")
//         metartauth = "YmlnZ3lwODA4OjgwOHdpemFy";
// } else if (link2.includes("goddessnudes.com")) {
//     link = link2.replace("www.goddessnudes.com", "members.metartvip.com")
//         metartauth = "YmlnZ3lwODA4OjgwOHdpemFy";
// } else if (link2.includes("rylskyart.com")) {
//     link = link2.replace("www.rylskyart.com", "members.metartvip.com")
//     sceneData.auth = "am9ubnljdW06ZmVuZGVyMTM=";
// } else if (link2.includes("eternaldesire.com")) {
//     link = link2.replace("www.eternaldesire.com", "members.metartvip.com")
//         metartauth = "aGFyaWI1NTU6MzNoazVkNng=";
//     metartauth = "a3VydDIzOnNlbGVjdDIz";
// }