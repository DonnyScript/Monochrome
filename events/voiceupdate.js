const { Events } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const fs = require('fs');
const path = require('path');
const player = useMainPlayer();
const { promisify } = require('util');
const wait = promisify(setTimeout);
let urlPath = path.join(__dirname, '../userdata/userURLs.json');

async function playWithRetry(channel, url, retryCount = 3, delay = 5000) {
    try {
        const { track } = await player.play(channel, url, {
            nodeOptions: {
                leaveOnEmpty: false,
                leaveOnEnd: false,
                leaveOnStop: false,
            }
        });
        return track;
    } catch (error) {
        if (retryCount <= 0) {
            console.log(`Failed to play ${url} after multiple retries: ${error}`);
            return null;
        }
        console.log(`Error playing ${url}. Retrying ${retryCount} more times.`);
        await wait(delay);
        return playWithRetry(channel, url, retryCount - 1, delay);
    }
}

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {
        try {
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
                if (fs.existsSync(urlPath)) {
                    const urlsFromFile = JSON.parse(fs.readFileSync(urlPath, 'utf8'));
                    userURLs = new Map(urlsFromFile);
                } else {
                    userURLs = new Map();
                }

                if (!userURLs) {
                    console.log("userURLs is not initialized or empty.");
                    return;
                }

                const url = userURLs.get(newState.member.id);
                if (!url) {
                    return;
                }

                const track = await playWithRetry(isInVoiceChannel, url);
                if (!track) {
                    console.log(`Failed to play URL for user ${newState.member.id}`);
                    return;
                }
            }
        } catch (error) {
            console.log(`Error in playing join sound - ${error}`);
            return;
        }
    },
};
