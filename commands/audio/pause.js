const { useQueue } = require("discord-player");
const { SlashCommandBuilder } = require('@discordjs/builders');
const wait = require('util').promisify(setTimeout);

module.exports = {
    category: 'audio',
    data: new SlashCommandBuilder()
        .setName('start_stop')
        .setDescription('starts or stops current track playing'),
    async execute(interaction) {
        try{
            const queue = useQueue(interaction.guild.id);

            queue.node.setPaused(!queue.node.isPaused());
            await interaction.reply(`Can you hear me?`);
            await wait(10000);
            await interaction.deleteReply();
        } catch (error) {
            await interaction.reply(`Error pausing track`);
            console.log(error);

        }
     } 
};