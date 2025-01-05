const { Events } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const { YoutubeiExtractor } = require("discord-player-youtubei");

module.exports = {
        name: Events.ClientReady,
        once: true,
        async execute(client) {
                const player = useMainPlayer();
                console.log(`Ready! Logged in as ${client.user.tag}`);
                const excludedExtractors = [
                        'VimeoExtractor',
                        'SoundCloudExtractor',
                        'ReverbnationExtractor',
                        'BridgedExtractor',
                        'AttachmentExtractor',
                ];
                player.extractors.loadDefault((extractor) => extractor !== "YouTubeExtractor");
                player.extractors.register(YoutubeiExtractor, {});
        },
};
