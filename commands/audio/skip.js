const { useQueue,GuildQueuePlayerNode } = require("discord-player");
const { SlashCommandBuilder } = require('@discordjs/builders');
const wait = require('util').promisify(setTimeout);

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
            await interaction.reply("Skipping track");
            await wait(10000);
            await interaction.deleteReply();
        } catch (error) {
            await interaction.reply(`Error skipping track: ${error}`);
        }
     } 
};