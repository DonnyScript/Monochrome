const { useQueue } = require("discord-player");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    category: 'audio',
    data: new SlashCommandBuilder()
        .setName('pause_resume')
        .setDescription('pauses or resumes current track playing'),
    async execute(interaction) {
        try{
            const queue = useQueue(interaction.guild.id);

            queue.node.setPaused(!queue.node.isPaused());//isPaused() returns true if that player is already paused
            await interaction.reply(`Can you hear me?`);
        } catch (error) {
            await interaction.reply(`Error pausing track`);
            console.log(error);

        }
     } 
};