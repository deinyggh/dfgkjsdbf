import { ActivityType, Events } from 'discord.js';
import mongoose from 'mongoose';
import config from '../config.json' with { type: 'json' };
import { start_queue } from '../utils/task_queue.js';

export default {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

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

		start_queue(client, "ready");

	},
};