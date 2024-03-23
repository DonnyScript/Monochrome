const { Events } = require('discord.js');
const { useMainPlayer } = require('discord-player');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		const player = useMainPlayer();
		console.log(`Ready! Logged in as ${client.user.tag}`);
		await player.extractors.loadDefault();

	},
};