const { useQueue,GuildQueuePlayerNode } = require("discord-player");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    category: 'audio',
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips current track playing'),
    async execute(interaction) {
        try{
            const queue = useQueue(interaction.guild.id);
            let guildQueue = new GuildQueuePlayerNode(queue);
            guildQueue.skip();
            return await interaction.reply("Skipping track");
        } catch (error) {
            await interaction.reply(`Error skipping track: ${error}`);
        }
     } 
};