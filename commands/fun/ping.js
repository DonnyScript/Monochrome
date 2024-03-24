const { SlashCommandBuilder } = require('discord.js');
const ytsr = require("youtube-sr");
const YouTube = require("youtube-sr").default;

module.exports = {
	category: 'fun',
	data: new SlashCommandBuilder()
		.setName('snitch')
		.setDescription('Want to know something?'),
	async execute(interaction) {
		const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
		let name = interaction.member.user.globalName;
		await interaction.reply({content: `${name} came out of the closet to me in private, thought everyone should know.`, tts:true});
		await wait(15000);
		await interaction.followUp({content: `${name} you though LOL`, ephemeral: true})
	},
};