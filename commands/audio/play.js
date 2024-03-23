const { SlashCommandBuilder } = require('@discordjs/builders');
const { useMainPlayer } = require('discord-player');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    category: 'audio',
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays a URL or searches YouTube')
        .addStringOption(option =>
            option
                .setName('input')
                .setDescription('Put YouTube video URL here')
                .setRequired(true)),
    async execute(interaction) {
        const player = useMainPlayer();
        const channel = interaction.member.voice.channel;
        if (!channel) return interaction.reply('You are not connected to a voice channel!');
        const query = interaction.options.getString('input', true);

        await interaction.deferReply();

        try {
            const { track } = await player.play(channel, query, { nodeOptions: {
                leaveOnEmpty: false,
                leaveOnEnd: false,
                leaveOnStop:false,
            }});
            //Fix embed builder
            const exampleEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`${track.title}`)
                .setURL(`${track.url}`)
                .setDescription('Some description here')
                .setThumbnail(  `${track.thumbnail}`)
                .setTimestamp()
                .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });
            console.log(exampleEmbed);
            await interaction.reply({ embeds: [exampleEmbed] });
            
        } catch (e) {
            return interaction.followUp(`Something went wrong: ${e}`);
        }
    }
};