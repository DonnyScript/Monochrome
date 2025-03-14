const { Events } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const { YoutubeiExtractor } = require("discord-player-youtubei");
const { DefaultExtractors } =  require('@discord-player/extractor');

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
                await player.extractors.loadMulti(DefaultExtractors);
                player.extractors.register(YoutubeiExtractor, {});
                // Player error event listener
player.events.on('playerError', (queue, error) => {
        console.error(`Player Error in queue [${queue.guild.name}]:`, error);
    });
    
    // Also consider adding general error event listener:
    player.events.on('error', (queue, error) => {
        console.error(`General Error [${queue.guild.name}]:`, error);
    });
        },
};
