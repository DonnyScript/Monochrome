const { useQueue,GuildQueuePlayerNode } = require("discord-player");
const { SlashCommandBuilder } = require('@discordjs/builders');
const wait = require('util').promisify(setTimeout);

module.exports = {
    category: 'audio',
    data: new SlashCommandBuilder()
        .setName('player_status')
        .setDescription('How long?'),
    async execute(interaction) {
        try{
            const queue = useQueue(interaction.guild.id);
            let guildQueue = new GuildQueuePlayerNode(queue);
            let message = guildQueue.createProgressBar({ timecodes: true, length: 40, leftChar: '-', rightChar: '-', separator: ' ',indicator: '@', queue: true });
            await interaction.reply(message);
            await wait(10000);
            await interaction.deleteReply();
        } catch (error) {
            await interaction.reply(`Error skipping track: ${error}`);
        }
     } 
};