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
    'YouTubeExtractor',
];


async function playWithRetry(channel, url, retryCount = 3, delay = 5000) {
    try {
        const player = useMainPlayer();
        const { track } = await player.play(channel, url, {
            nodeOptions: {
                leaveOnEmpty: false,
                leaveOnEnd: false,
                leaveOnStop: false,
            }, blockExtractors: {excludedExtractors}});
        return track;
    } catch (error) {
        if (retryCount <= 0) {
            throw new Error(`Failed to play ${url} after multiple retries: ${error}`);
        }
        console.log(`Error playing ${url}. Retrying ${retryCount} more times.`);
        await wait(delay);
        return playWithRetry(channel, url, retryCount - 1, delay);
    }
}


module.exports = {
    category: 'audio',
    data: new SlashCommandBuilder()
        .setName('play_all')
        .setDescription('Will play links from all supported streaming services')
        .addStringOption(option =>
            option
                .setName('input')
                .setDescription('Put Spotify video URL, video title, Spotify playlist here')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        const player = useMainPlayer();
        const channel = interaction.member.voice.channel;
        const query = interaction.options.getString('input', true);

        if (!channel) return interaction.followUp('You are not connected to a voice channel!');

        try {
            //const track = await playWithRetry(channel,query);
            const { track } = await player.play(channel, query, {
                nodeOptions: {
                    leaveOnEmpty: false,
                    leaveOnEnd: false,
                    leaveOnStop: false,
                }});

            const trackEmbed = new EmbedBuilder()
                .setColor(0x707a7e)
                .setTitle(`${track.title}`)
                .setURL(`${track.url}`)
                .setThumbnail(`${track.thumbnail}`)
                .setAuthor({ name: `${interaction.user.globalName} played: `, iconURL: `${interaction.user.displayAvatarURL({ dynamic: true, format: 'png', size: 4096 })}` })
                .setTimestamp();
                
            await interaction.followUp({ embeds: [trackEmbed] });
            await wait(60000);
            await interaction.deleteReply();
            
        } catch (error) {
            return interaction.followUp(`Something went wrong: ${error}`);
        }
    }
};