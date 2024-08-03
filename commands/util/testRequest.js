const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');


module.exports = {
    category: 'util',
    data: new SlashCommandBuilder()
        .setName('api_hit')
        .setDescription('Hit the myAnimeList api'),
    async execute(interaction) {
        axios
    .get('https://api.jikan.moe/v4/seasons/now')
    .then((response) => {
        console.log(response.data);
    })
    .catch((error) => {
        console.log(error);
    });
    }
};
