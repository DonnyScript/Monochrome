const { useQueue } = require("discord-player");
const { SlashCommandBuilder } = require('@discordjs/builders');
const wait = require('util').promisify(setTimeout);

module.exports = {
    category: 'audio',
    data: new SlashCommandBuilder()
        .setName('seek')
        .setDescription('Seeks to a specific part of the current track')
        .addStringOption(option => 
            option.setName('time')
                .setDescription('Time to seek to (format: mm:ss or ss)')
                .setRequired(true)),
    async execute(interaction) {
        try {
            const queue = useQueue(interaction.guild.id);

            // Check if the queue exists and is playing
            if (!queue || !queue.isPlaying()) {
                return interaction.reply("There is no track currently playing.");
            }

            const currentTrack = queue.currentTrack; 

            if (!currentTrack) {
                return interaction.reply("There is no track currently loaded.");
            }

            const timeInput = interaction.options.getString('time', true);
            let timeInSeconds = 0;

            if (timeInput.includes(':')) {
                const [minutes, seconds] = timeInput.split(':').map(Number);
                timeInSeconds = (minutes * 60) + seconds;
            } else {
                timeInSeconds = parseInt(timeInput, 10);
            }

            if (isNaN(timeInSeconds) || timeInSeconds < 0) {
                return interaction.reply("Invalid time format. Please use mm:ss or ss.");
            }

            const currentTrackDuration = currentTrack.duration / 1000;

            if (timeInSeconds > currentTrackDuration) {
                return interaction.reply(`The specified time exceeds the track's duration of ${Math.floor(currentTrackDuration / 60)}:${Math.floor(currentTrackDuration % 60).toString().padStart(2, '0')}.`);
            }

            await queue.node.seek(timeInSeconds * 1000);
            await interaction.reply(`Skipped to ${timeInSeconds} seconds in the track.`);
            await wait(10000);
            await interaction.deleteReply();

        } catch (error) {
            await interaction.reply(`Error seeking track: ${error}`);
        }
    }
};
