const {SlashCommandBuilder } = require('discord.js');
const { useQueue } = require("discord-player");
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
        .setName('remix')
        .setDescription('Finds the remix version of the song')
        .addStringOption(option =>
            option.setName('options')
                .setAutocomplete(true)
                .setDescription('What kind of remix?')
                .setRequired(true)),
    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        let choices = [];

        if (focusedOption.name === 'options') {
            choices = ['Nightcore','Heavy Metal','Gay','8D'];
        }

        const filtered = choices.filter(choice => choice.startsWith(focusedOption.value));
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        );
    },
    async execute(interaction) {
        try {
            await interaction.deferReply();
            const player = useMainPlayer();
            const channel = interaction.member.voice.channel;
            const modifier = interaction.options.getString('options');
            const queue = useQueue(interaction.guild.id);
            let newTrack =`"${modifier}" `+ queue.currentTrack;


                const { track } = await player.play(channel, newTrack, { nodeOptions: {
                    leaveOnEmpty: false,
                    leaveOnEnd: false,
                    leaveOnStop:false,
                }, blockExtractors : {excludedExtractors}});

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
            await interaction.followUp(`Error in remix block: ${error}`);
        }
    },
};    


