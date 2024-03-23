const { useQueue,GuildQueuePlayerNode } = require("discord-player");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    category: 'audio',
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('shuffle the current queue'),
    async execute(interaction) {
        try{                                                //Finish/Fix this
            const queue = useQueue(interaction.guild.id);
            let guildQueue = new GuildQueuePlayerNode(queue);
            await interaction.reply("Shuffling Queue");
        } catch (error) {
            await interaction.reply(`Error shuffling queue:`);
            console.log(error);

        }
     } 
};