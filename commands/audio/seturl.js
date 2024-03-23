const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');

let urlPath = './../../DiscordBot/Monochrome/userdata/userURLs.json';
let userURLs = new Map();

try {
    const data = fs.readFileSync(urlPath);
    userURLs = new Map(JSON.parse(data));
} catch (error) {
    console.error(`Error loading user URLs: ${error}`);
}

module.exports = {
    category: 'audio',
    data: new SlashCommandBuilder()
        .setName('seturl')
        .setDescription('Sets intro url')
        .addStringOption(option =>
            option
                .setName('url')
                .setDescription('Put YouTube video URL or title here')
                .setRequired(true)),
    async execute(interaction) {
        try{

        const query = interaction.options.getString('url', true);

        if (!query || !isValidUrl(query)) {
            return interaction.reply('Please provide a valid YouTube URL!');
        }

        userURLs.set(interaction.member.user.id, query);
        
        fs.writeFileSync(urlPath, JSON.stringify([...userURLs]));
        
        return interaction.reply(`Your custom YouTube URL has been set to: ${query}`);
        } catch (error) {
            await interaction.reply(`Error in setting intro: ${error}`);
        }
     } 
};

const isValidUrl = urlString => {
    try { 
        return Boolean(new URL(urlString)); 
    } catch(e) { 
        return false; 
    }
}
