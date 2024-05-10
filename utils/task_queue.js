import { EmbedBuilder, time } from 'discord.js';
import { Readable } from "node:stream";
import { generate_link_details, host_detail_check, link_finder } from '../buttons/generate_link.js';
import fileSchema from '../models/fileSchema.js';
import saSchema from '../models/saSchema.js';
import { createResponse, wait } from '../utils/common_functions.js';
import { megajsStreamUpload } from '../utils/meganz.js';
import { deleteTask, findProfile, listTasks, updateTask } from '../utils/mongodb.js';
import { storageCheck, uploadStream } from './googleapi.js';

let task_run_status = false;
const active_sa = [];

const queue = async (client, tasks) => {
	const bot_profile = await findProfile({userID: client.user.id});
	const channel = await client.channels.cache.get(bot_profile.additional_details?.botChannelID);

	for (let index = 0; index < tasks.length; index++) {
		const task = tasks[index];
		const user_profile = await findProfile({userID: task.user_id});
		let scene_json = JSON.parse(task.scene_json, {encoding: "utf-8"});
		const message = await channel.messages.fetch(task.task_msg_id);
		const embed = message.embeds[0];
		let status_string = "Error.";
		let color = "DarkRed"
		while (task.retries < 3) {
			task.retries = task.retries + 1;
			await updateTask(task.task_msg_id, {
				$inc: {
					retries: 1
				}
			});
			try {
				if (task.retries > 1) {
					const new_scene_json = await generate_link_details(scene_json.result?.id ?? scene_json.link, user_profile.userHostDetails.defaultHost, scene_json.link_network);
					new_scene_json.quality = scene_json.quality;
					new_scene_json.user_host = scene_json.user_host;
					scene_json = await link_finder(new_scene_json);
				}
				await host_detail_check(user_profile.userHostDetails);
				let new_headers = {};
				switch (scene_json.link_network) {
					case 'pure_xxx':
					case 'primalfetishnetwork':
					case 'nadinej':
					case "metartnetwork":
						new_headers = {
							'Authorization': `Basic ${scene_json.auth}`
						}
					break;

					case 'atkgirlfriends':
					case 'xart':
					case 'ajp_network':
					case 'watch4beautyr':
					case 'wtfpass':
						new_headers = {
							"Cookie": `${scene_json.auth}`
						}
					break;

					default:
						break;
				}
				const response = await createResponse(scene_json.download_link, {headers: new_headers});
				const file_size = parseInt(response.headers.get("content-length"));
				const stream = Readable.fromWeb(response.body);
				const edited_embed = EmbedBuilder.from(embed).setFields(
					{ name: "Status", value: "Processing", inline: true },
					{ name: "Host", value: scene_json.user_host, inline: true },
					{ name: "Size", value: `${parseInt(file_size / (1024 * 1024))} MB`, inline: true },
				);
				await message.edit({embeds: [edited_embed]});

				if (scene_json.user_host === "Mega.nz") {
					await megajsStreamUpload(user_profile.userHostDetails.mega, scene_json.file_name, file_size, stream);
					status_string = `Completed @ ${time(new Date(), "R")}`;
					color = "Green";
				} else if (scene_json.user_host.includes("G-Drive")) {
					let service_account = "";
					let sa_index;
					switch (scene_json.user_host) {
						case 'G-Drive Shared Drive':{

						}
						break;
						case 'G-Drive Personal Folder':{
							service_account = JSON.parse(user_profile.userHostDetails?.gdrive_personal_sa);
						}
						break;
						case 'G-Drive Public SA':{
							const array = await saSchema.distinct("guildID");
							const fID = array.includes(channel.guildId) ? channel.guildId : channel.guildId;
							const sa_from_db = await saSchema.findOne({ storageFree: { $gt: file_size }, guildID: fID, SaFile: { $nin: active_sa} }).sort({ storageFree: 1 });
							if (!sa_from_db) {
								status_string = "Error. No SA has this much free space."
								break;
							}
							scene_json.sa_file = sa_from_db;
							service_account = JSON.parse(sa_from_db.SaJSON);
							active_sa.push(sa_from_db.SaFile);
							sa_index = active_sa.indexOf(sa_from_db.SaFile);
						}
						break;

						default:
							break;
					}
					const fileID = await uploadStream(stream, user_profile.userHostDetails.gdrive_personal, scene_json.file_name, service_account, "upload");
					if (sa_index > -1 && user_profile.userHostDetails.defaultHost === "G-Drive Public SA") {
						active_sa.splice(sa_index, 1);
						await fileSchema.create({
							SaFile: scene_json.sa_file.SaFile,
							guildID: scene_json.sa_file.guildID,
							fileDeleteTime: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)),
							fileID: fileID
						})
						const storage = await storageCheck(service_account);
						await saSchema.findOneAndUpdate({SaFile: scene_json.sa_file.SaFile, guildID: scene_json.sa_file.guildID}, {
							$set: {
								storageUsed: parseInt(storage.usage),
								storageLimit: parseInt(storage.limit),
								storageFree: parseInt(storage.limit) - parseInt(storage.usage)
							}
						});
					}
					status_string = `Completed @ ${time(new Date(), "R")}`;
					color = "Green";
				} else {
					status_string = "Error. Host not initialised for queue.";
				}
				let final_embed;
				if (status_string.includes("Completed")) {
					final_embed = EmbedBuilder.from(JSON.parse(scene_json.final_embed));
					final_embed
					.setColor(color)
					.addFields(
						{ name: "Size", value: `${parseInt(file_size / (1024 * 1024))} MB`, inline: true },
						{ name: "Status", value: status_string, inline: true },
						{ name: "Host", value: scene_json.user_host, inline: true },
					);
				} else {
					final_embed = EmbedBuilder.from(embed)
					.setColor(color)
					.setFields(
					{ name: "Status", value: status_string, inline: true },
					{ name: "Host", value: scene_json.user_host, inline: true },
					{ name: "Size", value: `${parseInt(file_size / (1024 * 1024))} MB`, inline: true },
				);
				}
				
				await message.edit({embeds: [final_embed]});
				await deleteTask(task.task_msg_id);
				break;
			} catch (error) {
				if (task.retries > 2) {
					status_string = `Error - ${error}`;
					const final_embed = EmbedBuilder.from(embed)
						.setColor(color)
						.setFields(
						{ name: "Status", value: status_string, inline: true },
						{ name: "Host", value: scene_json.user_host, inline: true },
					);
					await message.edit({embeds: [final_embed]});
					await deleteTask(task.task_msg_id);
				}
				console.log(error);
			}
		}
	}
}

const start_queue = async (client, event = "interaction") => {
	await wait(60000);
	while (true) {
		if (task_run_status == true && event === "interaction") {
			break;
		}
		if (task_run_status == true && event === "ready") {
			await wait(1000 * 60 * 60);
		}
		if (task_run_status == false) {
			const tasks = await listTasks();
			if (tasks.length > 0) {
				console.log("queue starts");
				task_run_status = true;
				try {
					await queue(client, tasks);
				} catch (error) {
					console.log(error);
				}
				task_run_status = false;
				const new_tasks = await listTasks();
				if (new_tasks.length === 0) {
					if (event === "ready") {
						await wait(1000 * 60 * 60);
					}
					else{
						break;
					}
				}
			}
		}


	}
}

export { queue, start_queue };