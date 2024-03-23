const { SlashCommandBuilder } = require('discord.js');
const ytsr = require("youtube-sr");
const YouTube = require("youtube-sr").default;

module.exports = {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
		let name = interaction.member.user.globalName;
		await interaction.reply({content: `My name is ${name}, and I am officially coming out gay, thank you everyone.`, ephemeral: true, tts:true});
		await wait(15000);
		await interaction.followUp({content: `${name} you though LOL`, ephemeral: true})
	},
};