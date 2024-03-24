const { Events } = require('discord.js');
const { useMainPlayer} = require('discord-player');
const fs = require('node:fs');
const player = useMainPlayer();
let userURLs;
let urlPath = './userdata/userURLs.json';

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {
        const wasInVoiceChannel = oldState && oldState.channelId;
        const isInVoiceChannel = newState.channelId;
        const afkChannel = '532776306497290241';

        if (isInVoiceChannel === afkChannel) {
            return;
        }

        if (newState.streaming || (oldState && oldState.streaming)) {
            return;
        }

        if (!wasInVoiceChannel && isInVoiceChannel) {
            try {
                if (fs.existsSync(urlPath)) {
                    const urlsFromFile = JSON.parse(fs.readFileSync(urlPath));
                    userURLs = new Map(urlsFromFile);
                  } else {
                    userURLs = new Map([]);
                  }     

                  if (!userURLs) {
                    console.log("userURLs is not initialized or empty.");
                    return;
                    }

                const url = userURLs.get(newState.member.id);
                if (!url) {
                    return;
                }
                player.play(isInVoiceChannel, url, {
                    nodeOptions: { 
                        leaveOnEmpty: false,
                        leaveOnEnd: false,
                        leaveOnStop: false,
                    }
                });
            } catch (error) {
                console.log(`Error in playing join sound - ${error}`);
            }
        }
    },
};


