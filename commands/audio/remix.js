const {SlashCommandBuilder } = require('discord.js');
const { useQueue } = require("discord-player");


module.exports = {
    category: 'audio',
    data: new SlashCommandBuilder()
        .setName('remix')
        .setDescription('Finds the remix version of the song')
        .addStringOption(option =>
            option.setName('options')
                .setAutocomplete(true)
                .setDescription('What kind of remix?')
                .setRequired(true)),
    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        let choices = [];

        if (focusedOption.name === 'options') {
            choices = ['Nightcore','HeavyMetal','Gay','8D']; // 2:51 finish this, make it search for the current song but with a remix on it. Make a custom field.
        }

        const filtered = choices.filter(choice => choice.startsWith(focusedOption.value));
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        );
    },
    async execute(interaction) {
        try {
            const option = interaction.options.getString('options').toLowerCase();
            const queue = useQueue(interaction.guild.id);
    
            switch (option) {
                case 'nightcore': 
                
                    break;
    
                case 'HeavyMetal':
                    queue.setRepeatMode(1); 
                    await interaction.reply(`Loops the current track`);
                    break;
    
                case 'queue':
                    queue.setRepeatMode(2); 
                    await interaction.reply(`Loops the current queue`);
                    break;
    
                case 'autoplay':
                    queue.setRepeatMode(3);
                    await interaction.reply(`Play related songs automatically based on your existing queue`);
                    break;
            }
        } catch (error) {
            await interaction.reply(`Error in playlist block: ${error}`);
        }
    },
};    


