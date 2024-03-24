const { useHistory } = require("discord-player");
const { SlashCommandBuilder } = require('@discordjs/builders');
const wait = require('util').promisify(setTimeout);

module.exports = {
    category: 'audio',
    data: new SlashCommandBuilder()
        .setName('go_back')
        .setDescription('Plays previous track'),
    async execute(interaction) {
        try{
            const history = useHistory(interaction.guild.id);
            if(history.isEmpty()){
                await interaction.reply("Nothing to go back to");
                await wait(10000);
                await interaction.deleteReply();
                return;
            }
            await history.previous();
            await interaction.reply("Playing previous track");
            await wait(10000);
            await interaction.deleteReply();
            return;
        } catch (error) {
            await interaction.reply(`Error going back`);
        }
     } 
};