const { useQueue } = require("discord-player");
const { SlashCommandBuilder } = require('@discordjs/builders');
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
            choices = ['Display', 'Shuffle'];
        }

        const filtered = choices.filter(choice => choice.startsWith(focusedOption.value));
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        );
    },
    async execute(interaction) {
        const option = interaction.options.getString('option').toLowerCase();
        switch (option) {
            case 'display': 
            try {
                const queue = useQueue(interaction.guild.id);
                const tracks = queue.tracks.toArray();
                let currentQueue = `Current queue:\n- ${queue.currentTrack} \n`;
                tracks.forEach((title) => {
                    currentQueue += `- ${title} \n`;
                }
                )
                interaction.reply(currentQueue);
            } catch (error) {
                await interaction.reply(`Can not display that playlist: ${error}`)
            }
            break;
            case 'shuffle':
                try{ 
                    const queue = useQueue(interaction.guild.id);
                    queue.toggleShuffle(false);
                    await interaction.reply('Shuffling queue');
                } catch (error) {
                    await interaction.reply(`Error shuffling queue:`);
                    console.log(error);
                }
        break;
        }
    }
};

