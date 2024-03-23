const {SlashCommandBuilder } = require('discord.js');
const { useQueue } = require("discord-player");
let choices = [];


module.exports = {
    category: 'audio',
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('loop actions')
        .addStringOption(option =>
            option.setName('options')
                .setAutocomplete(true)
                .setDescription('Do WHAT to the queu???')
                .setRequired(true)),
    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);

        if (focusedOption.name === 'options') {
            choices = ['Off','Track','Queue','Autoplay'];
        }

        const filtered = choices.filter(choice => choice.startsWith(focusedOption.value));
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        );
    },
    async execute(interaction) {
        try {
            let name = interaction.member.user.globalName;
            let response = interaction.options.getString('options')
            const option = interaction.options.getString('options').toLowerCase();
            console.log(choices.includes(response));

            if(!choices.includes(response)){
                await interaction.reply({content: `${name} did not use the command correctly, thought everyone should know.`, tts:true});
                await wait(5000);
                await interaction.deleteReply();
                return;
            }
            
            const queue = useQueue(interaction.guild.id);

            switch (option) {
                case 'off': 
                try {
                    queue.setRepeatMode(0);
                    await interaction.reply(`Default mode with no loop active`);
                } catch (error) {
                    await interaction.reply(`Can not turn off loop because: ${error}`)
                }
                    break;
    
                case 'track':
                    queue.setRepeatMode(1); 
                    await interaction.reply(`Looping the current track`);
                    break;
    
                case 'queue':
                    queue.setRepeatMode(2); 
                    await interaction.reply(`Looping the current queue`);
                    break;
    
                case 'autoplay':
                    queue.setRepeatMode(3);
                    await interaction.reply(`Playing related songs automatically based on your existing queue`);
                    break;
            }
            
        } catch (error) {
            await interaction.reply(`Error in playlist block: ${error}`);
        }
    },
};    


