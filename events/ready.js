import { ActivityType, Events } from 'discord.js';
import mongoose from 'mongoose';
import config from '../config.json' with { type: 'json' };
import fileSchema from "../models/fileSchema.js";
import saSchema from "../models/saSchema.js";
import { wait } from '../utils/common_functions.js';
import { deleteOneFile, storageCheck } from '../utils/googleapi.js';
import bangbros from '../utils/sites/bangbros.js';
import { start_queue } from '../utils/task_queue.js';

export default {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		async function dailyReset(client) {
			function getHoursDifference() {
				const currentTime = new Date();
				const targetTime = new Date();
				targetTime.setHours(22, 1, 1, 1);
				if (currentTime.getHours() >= 22) {
					targetTime.setDate(targetTime.getDate() + 1);
				}
				const diff = targetTime.getTime() - currentTime.getTime();
				return diff ;
			}

			while (true) {
				try {
					await new Promise(resolve => setTimeout(resolve, getHoursDifference()));
					const date = new Date();
					if (date.getHours() === 22) {

						try{
							await client.user.setPresence({
								activities: [{
									name: `8K Waifu`,
									type: ActivityType.Watching
								}],
								status: 'online'
							});

							//File Delete
							// const filesToDelete = await fileSchema.find({fileDeleteTime : { $lt: new Date()}});
							// for (let index = 0; index < filesToDelete.length; index++) {
							// 	const file = filesToDelete[index];
							// 	const service_account = JSON.parse((await saSchema.findOne({SaFile: file.SaFile})).SaJSON);

							// 	try {
							// 		await fileSchema.findOneAndDelete({fileID: file.fileID});
							// 		await deleteOneFile(service_account, file.fileID);
							// 		await wait(1000)
							// 	} catch(error) {
							// 		console.log(error);
							// 	}
							// }
							//Storage Update
							// const SAFiles = await saSchema.find({});
							// for (let index = 0; index < SAFiles.length; index++) {
							// 	const SaFile = SAFiles[index];
							// 	const storage = await storageCheck(JSON.parse(SaFile.SaJSON));
							// 	await saSchema.findOneAndUpdate({SaFile: SaFile.SaFile, guildID: SaFile.guildID}, {
							// 		$set: {
							// 				storageUsed: parseInt(storage.usage),
							// 				storageLimit: parseInt(storage.limit),
							// 				storageFree: parseInt(storage.limit) - parseInt(storage.usage)
							// 		}
							// 	});
							// }
							//BB Update
							// await bangbros.dbGenerateBase(client);

						} catch (error) {
							console.error(error);
						}
					}
				} catch (error) {
					console.error(error);
				}
			}
		}

		await client.user.setPresence({
			activities: [{
				name: `8K Waifu`,
				type: ActivityType.Watching
			}],
			status: 'online'
		});

		if(!config.DBURL) return;
		mongoose.set('strictQuery', true)
		mongoose.connect(config.DBURL, {}).then(() => {
			console.log("Bot connected to DB!")
		}).catch((err) => {
			console.log(err)
			return;
		});

		// start_queue(client, "ready");
		dailyReset(client);

	},
};