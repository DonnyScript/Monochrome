const { Events } = require('discord.js');
const { useMainPlayer} = require('discord-player');
const fs = require('node:fs');
const player = useMainPlayer();
let userURLs;
let urlPath = './userdata/userURLs.json';

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {
        const channel = newState.channelId;
        let afkChannel = '532776306497290241';
        if(newState.channelId == afkChannel){
            return;
        }
        try { 
            if(newState.streaming || oldState.streaming == true){
                return;
            }
            if (fs.existsSync(urlPath)) {
                const urlsFromFile = JSON.parse(fs.readFileSync(urlPath));
                userURLs = new Map(urlsFromFile);
              } else {
                userURLs = new Map([]);
              }
            
            if (oldState.channelId && !newState.channelId) {
                return;
            }
            const url = userURLs.get(newState.member.id);
            if (!url) {
                return;
            }

            player.play(channel, url, {
                nodeOptions:{ 
                    leaveOnEmpty: false,
                    leaveOnEnd: false,
                    leaveOnStop:false,
                }});

        } catch (error) {
            console.log(`Error in playing join sound - ${error}`);
        }
    },
};
