const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const titleInfoMap = {};

async function suggest(interaction) {
    const query = interaction.options.getString('input', false)?.trim();
    if (!query) return;

    try {
        const response = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}`);
        const jsonResponse = response.data;

        const titlesArray = jsonResponse.data.map(item => {
            const defaultTitleObj = item.titles.find(title => title.type === 'Default');
            const defaultTitle = defaultTitleObj ? defaultTitleObj.title : item.title;
            let synopsis = item.synopsis || '';
            synopsis = synopsis.replace('\n\n[Written by MAL Rewrite]', '');
            const airingDates = item.aired.string || 'N/A';
            titleInfoMap[defaultTitle] = { synopsis, airingDates };
            return defaultTitle;
        });

        const formattedResult = titlesArray.slice(0, 10).map(title => ({
            name: title,
            value: title,
        }));

        await interaction.respond(formattedResult);
    } catch (error) {
        console.error(error);
        await interaction.respond([{ name: 'Error fetching results', value: '' }]);
    }
}

module.exports = {
    category: 'util',
    data: new SlashCommandBuilder()
        .setName('api_hit')
        .setDescription('Hit the MyAnimeList API')
        .addStringOption(option =>
            option
                .setName('input')
                .setDescription('Enter anime title')
                .setRequired(true)
                .setAutocomplete(true)),
    async autocomplete(interaction) {
        await suggest(interaction);
    },
    async execute(interaction) {
        const selectedTitle = interaction.options.getString('input', false)?.trim();
        if (!selectedTitle) return;

        const info = titleInfoMap[selectedTitle];
        if (info) {
            const { synopsis, airingDates } = info;
            await interaction.reply(`**${selectedTitle}**\n\n**Airing Date:** ${airingDates}\n\n**Synopsis:**\n${synopsis}`);
        } else {
            await interaction.reply('Sorry, I could not find the information for the selected title.');
        }
    }
};