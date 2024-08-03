const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');


module.exports = {
    category: 'util',
    data: new SlashCommandBuilder()
        .setName('watch_group')
        .setDescription('create a new watch group')
        .addStringOption(option =>
            option.setName('option')
                .setAutocomplete(true)
                .setDescription('WatchGroup Action')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('group_name')
                .setDescription('Name of Group')
                .setAutocomplete(true))
        .addStringOption(option =>
            option.setName('value')
                .setDescription('Enter value')),
    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        let choices = [];

        if (focusedOption.name === 'option') {
            choices = ['New Group', 'Create', 'Delete Song', 'Display'];
        }

        if (focusedOption.name === 'playlist') {
            choices = await getPlaylistNames(playlists);
        }

        const filtered = choices.filter(choice => choice.startsWith(focusedOption.value));
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        );
    },
    async execute(interaction) {
        // axios
        //     .get('https://api.jikan.moe/v4/seasons/now')
        //     .then((response) => {
        //         console.log(response.data);
        //     })
        //     .catch((error) => {
        //         console.log(error);
        //     });



    }
};
