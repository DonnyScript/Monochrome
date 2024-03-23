const { useHistory } = require("discord-player");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    category: 'audio',
    data: new SlashCommandBuilder()
        .setName('go_back')
        .setDescription('Plays previous track'),
    async execute(interaction) {
        try{
            const history = useHistory(interaction.guild.id);
  
            if(history.isEmpty()){
                return await interaction.reply("Nothing to go back to");
            }
            await history.previous();
            return await interaction.reply("Playing previous track");
        } catch (error) {
            await interaction.reply(`Error skipping track`);
            console.log(error)
        }
     } 
};