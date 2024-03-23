const { useQueue,GuildQueuePlayerNode, GuildQueue } = require("discord-player");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    category: 'audio',
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('shuffle the current queue'),
    async execute(interaction) {
        try{ 
            const queue = useQueue(interaction.guild.id);
            queue.toggleShuffle(false);
            await interaction.reply('Shuffling queue');
        } catch (error) {
            await interaction.reply(`Error shuffling queue:`);
            console.log(error);
        }
     } 
};