const { SlashCommandBuilder } = require('@discordjs/builders');
const { useMainPlayer } = require('discord-player');
const { EmbedBuilder } = require('discord.js');
const wait = require('util').promisify(setTimeout);
const excludedExtractors = [ 
    'VimeoExtractor',
    'SoundCloudExtractor',
    'ReverbnationExtractor',
    'BridgedExtractor',
    'AttachmentExtractor',
    'AppleMusicExtractor',
    'SpotifyExtractor',
];
module.exports = {
    category: 'audio',
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays a URL or searches YouTube')
        .addStringOption(option =>
            option
                .setName('input')
                .setDescription('Put YouTube video URL, video title, YouTube playlist here')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        const player = useMainPlayer();
        const channel = interaction.member.voice.channel;
        const query = interaction.options.getString('input', true);

        if (!channel) return interaction.followUp('You are not connected to a voice channel!');

        try {
            const { track } = await player.play(channel, query, { nodeOptions: {
                leaveOnEmpty: false,
                leaveOnEnd: false,
                leaveOnStop:false,
            },blockExtractors : {excludedExtractors} });

            const trackEmbed = new EmbedBuilder()
                .setColor(0x707a7e)
                .setTitle(`${track.title}`)
                .setURL(`${track.url}`)
                .setThumbnail(`${track.thumbnail}`)
                .setAuthor({ name: `${interaction.user.globalName} played: `, iconURL: `${interaction.user.displayAvatarURL({ dynamic: true, format: 'png', size: 4096 })}` })
                .setTimestamp();
                
            await interaction.followUp({ embeds: [trackEmbed] });
            await wait(25000);
            await interaction.deleteReply();
            
        } catch (error) {
            return interaction.followUp(`Something went wrong: ${error}`);
        }
    }
};