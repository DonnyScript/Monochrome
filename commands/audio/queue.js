const { useQueue } = require("discord-player");
const { SlashCommandBuilder } = require('@discordjs/builders');
const wait = require('util').promisify(setTimeout);
const { EmbedBuilder } = require('discord.js');

module.exports = {
    category: 'audio',
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('queue operations')
        .addStringOption(option =>
            option.setName('option')
                .setDescription('Hmmm, what to do?')
                .setRequired(true)
                .setAutocomplete(true)),
    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        if (focusedOption.name === 'option') {
            choices = ['Display', 'Shuffle', 'Clear','Playing'];
        }

        const filtered = choices.filter(choice => choice.startsWith(focusedOption.value));
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        );
    },
    async execute(interaction) {
        const queue = useQueue(interaction.guild.id);
        const option = interaction.options.getString('option').toLowerCase();
        switch (option) {
            case 'display':
            try {
                if (queue == null) {
                    await interaction.reply("Queue is empty");
                    await wait(10000);
                    await interaction.deleteReply();
                    break;
                }
                const tracks = queue.tracks.toArray();
                let currentQueue = `Current queue:\n- ${queue.currentTrack} \n`;
                tracks.forEach((title) => {
                    currentQueue += `- ${title} \n`;
                }
                )
                await interaction.reply(currentQueue);
                await wait(10000);
                await interaction.deleteReply();
            } catch (error) {
                await interaction.reply(`Can not display that playlist: ${error}`)
            }
            break;

            case 'shuffle':
                try{ 
                    if (queue == null) {
                        await interaction.reply("Nothing to shuffle");
                        await wait(10000);
                        await interaction.deleteReply();
                        break;
                    }else if (queue.currentTrack == null){
                        await interaction.reply("Nothing to shuffle");
                        await wait(15000);
                        await interaction.deleteReply();
                        break;
                    }
                    queue.toggleShuffle(false);
                    await interaction.reply('Shuffling queue');
                    await wait(10000);
                    await interaction.deleteReply();
                } catch (error) {
                    await interaction.reply(`Error shuffling queue:`);
                    console.log(error);
                }
            break;

            case 'clear':
                try {
                    if (queue == null) {
                        await interaction.reply("Nothing to clear");
                        await wait(10000);
                        await interaction.deleteReply();
                        break;
                    } else if (queue.currentTrack == null){
                        await interaction.reply("Nothing to clear");
                        await wait(15000);
                        await interaction.deleteReply();
                        break;
                    }
                    queue.clear();
                    await interaction.reply("Queue is cleared");
                    await wait(10000);
                    await interaction.deleteReply();
                }catch (error) {
                    await interaction.reply("Can not clear that queue")
                }
            break;
            case 'playing':
                if (queue == null) {
                    await interaction.reply("Nothing is playing");
                    await wait(15000);
                    await interaction.deleteReply();
                    break;
                } else if (queue.currentTrack == null){
                    await interaction.reply("Nothing is playing");
                    await wait(15000);
                    await interaction.deleteReply();
                    break;
                }
                await interaction.reply(`Current track: ${queue.currentTrack}`)
                await wait(10000);
                await interaction.deleteReply();

            break;
        }
    }
};

