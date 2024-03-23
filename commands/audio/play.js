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
        const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        const query = interaction.options.getString('input', true);
        if (!channel) return interaction.reply('You are not connected to a voice channel!');

        try {
            const { track } = await player.play(channel, query, { nodeOptions: {
                leaveOnEmpty: false,
                leaveOnEnd: false,
                leaveOnStop:false,
            }});
            
            const trackEmbed = new EmbedBuilder()
                .setColor(0x707a7e)
                .setTitle(`${track.title}`)
                .setURL(`${track.url}`)
                .setThumbnail(`${track.thumbnail}`)
                .setAuthor({ name: `${interaction.user.globalName} played: `, iconURL: `${interaction.user.displayAvatarURL({ dynamic: true, format: 'png', size: 4096 })}` })
                .setTimestamp();
            await interaction.reply({ embeds: [trackEmbed] });
            await wait(25000);
            await interaction.deleteReply();
            
        } catch (error) {
            return interaction.followUp(`Something went wrong: ${error}`);
        }
    }
};