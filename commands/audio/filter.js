const {SlashCommandBuilder } = require('discord.js');
const { useQueue, } = require("discord-player");
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
let choices = [];

module.exports = {
    category: 'audio',
    data: new SlashCommandBuilder()
        .setName('filter')
        .setDescription('What do you want the audio to sound like?')
        .addStringOption(option =>
            option.setName('options')
                .setAutocomplete(true)
                .setDescription('What kind of filter?')
                .setRequired(true)),
    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);

        if (focusedOption.name === 'options') {
            choices = [
                'default',
                'aecho',
                'bassboost',
                'bassboost_low',
                'nightcore',
                'aphaser',
                'apulsator',
                'crystalizer',
                'areverse',
                'asuperstop',
                'earwax',
                'flanger',
                'vibrato',
                'lowpass',
                'tremolo',
                'vaporwave',
                '8D',
                'earrape',
                'expander',
                'lofi',
                'treble',
                'chorus',
                'firequalizer',
                'haas',
                'rubberband',
                ];
        }

        const filtered = choices.filter(choice => choice.startsWith(focusedOption.value));
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        );
    },
    async execute(interaction) {
        try {
            await interaction.deferReply();
            const modifier = interaction.options.getString('options');
            let name = interaction.member.user.globalName;
            const queue = useQueue(interaction.guild.id);
            const filterer = queue.filters.ffmpeg;
    
            if (!filterer) {
                await interaction.followUp(`There is nothing to filter`);
                await wait(10000);
                await interaction.deleteReply();
                return;
            }
    
            if (!choices.includes(modifier)) {
                await interaction.followUp({ content: `${name} did not use the command correctly, thought everyone should know.`, tts: true });
                await wait(10000);
                await interaction.deleteReply();
                return;
            }
    
            if (modifier === 'default') {
                filterer.setFilters([]);
            } else {
                await filterer.toggle(modifier);
            }
    
            await interaction.followUp(`${modifier} applied to audio stream`);
            await wait(20000);
            await interaction.deleteReply();
        } catch (error) {
            await interaction.followUp(`(no livestreams) Error in filter block: ${error}`);
            await wait(10000);
            await interaction.deleteReply();
        }
    }
    ,
};    


