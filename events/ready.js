const { Events } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const { YoutubeiExtractor, generateOauthTokens } = require("discord-player-youtubei");
const ENV_VAR = require("../config.json")

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		const player = useMainPlayer();
		const oauthTokens = await generateOauthTokens(); // The tokens printed from step above
		console.log(`Ready! Logged in as ${client.user.tag}`);
		const excludedExtractors = [ 
			'VimeoExtractor',
			'SoundCloudExtractor',
			'ReverbnationExtractor',
			'BridgedExtractor',
			'AttachmentExtractor',
		];

		player.extractors.loadDefault((ext) => !excludedExtractors.includes(ext));
		await player.extractors.loadDefault((extractor) => extractor !== "YouTubeExtractor");

		await player.extractors.register(YoutubeiExtractor, {
			authentication: oauthTokens
		});
	},
};