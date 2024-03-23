const { SlashCommandBuilder ,EmbedBuilder} = require('discord.js');
const ytsr = require("youtube-sr");
const YouTube = require("youtube-sr").default;

module.exports = {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('embed')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
        const exampleEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Some title')
        .setURL('https://discord.js.org/')
        .setDescription('Some description here')
        .setThumbnail('https://i.imgur.com/AfFp7pu.png')
        .setTimestamp()
        .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });
    
    await interaction.reply({ embeds: [exampleEmbed] });
	},
};