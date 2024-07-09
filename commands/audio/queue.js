const { useQueue } = require("discord-player");
const { SlashCommandBuilder } = require('@discordjs/builders');
const wait = require('util').promisify(setTimeout);
let choices = [];

module.exports = {
    category: 'audio',
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('queue operations')
        .addStringOption(option =>
            option.setName('option')
                .setDescription('Hmmm, what to do?')
                .setRequired(true)
                .setAutocomplete(true)),
    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        if (focusedOption.name === 'option') {
            choices = ['Display', 'Shuffle', 'Clear','Playing'];
        }

        const filtered = choices.filter(choice => choice.startsWith(focusedOption.value));
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        );
    },
    async execute(interaction) {
        const queue = useQueue(interaction.guild.id);
        const option = interaction.options.getString('option').toLowerCase();
        const userQuery = interaction.options.getString('option');
        const numberOfTracks = queue.getSize();

        if(!choices.includes(userQuery)){
            await interaction.reply({content: `${name} did not use the command correctly, thought everyone should know.`, tts:true});
            await wait(5000);
            await interaction.deleteReply();
            return;
        }
        switch (option) {
            case 'display':
            try {
                if(numberOfTracks == 0){
                    await interaction.reply("Queue is empty");
                    await wait(10000);
                    await interaction.deleteReply();
                    break;
                }

                const tracks = queue.tracks.toArray();
                const pageSize = 25;
                let pages = [];

                for (let i = 0; i < tracks.length; i += pageSize) {
                    let page = tracks.slice(i, i + pageSize);
                    let currentPage = `Current queue (Page ${Math.ceil((i + 1) / pageSize)}):\n`;
                    page.forEach((title, index) => {
                        currentPage += `${i + index + 1}. ${title}\n`;
                    });
                    pages.push(currentPage);
                }

                await interaction.reply(pages[0]); 
                pages.shift();

                for (const page of pages) {
                    await interaction.followUp(page);
                    await wait(5000);
                }

            } catch (error) {
                await interaction.reply(`Can not display that queue: ${error}`)
                await wait(10000);
                await interaction.deleteReply();
                break;
            }
            break;
            
            
            

            case 'shuffle':
                try{ 
                    if (queue == null) {
                        await interaction.reply("Nothing to shuffle");
                        await wait(10000);
                        await interaction.deleteReply();
                        break;
                    }else if (queue.currentTrack == null){
                        await interaction.reply("Nothing to shuffle");
                        await wait(15000);
                        await interaction.deleteReply();
                        break;
                    }
                    queue.toggleShuffle(false);
                    await interaction.reply('Shuffling queue');
                    await wait(10000);
                    await interaction.deleteReply();
                } catch (error) {
                    await interaction.reply(`Error shuffling queue:`);
                    console.log(error);
                }
            break;

            case 'clear':
                try {
                    if (queue == null) {
                        await interaction.reply("Nothing to clear");
                        await wait(10000);
                        await interaction.deleteReply();
                        break;
                    } else if (queue.currentTrack == null){
                        await interaction.reply("Nothing to clear");
                        await wait(15000);
                        await interaction.deleteReply();
                        break;
                    }
                    queue.clear();
                    await interaction.reply("Queue is cleared");
                    await wait(10000);
                    await interaction.deleteReply();
                }catch (error) {
                    await interaction.reply("Can not clear that queue")
                }
            break;
            case 'playing':
                if (queue == null) {
                    await interaction.reply("Nothing is playing");
                    await wait(15000);
                    await interaction.deleteReply();
                    break;
                } else if (queue.currentTrack == null){
                    await interaction.reply("Nothing is playing");
                    await wait(15000);
                    await interaction.deleteReply();
                    break;
                }
                await interaction.reply(`Current track: ${queue.currentTrack}`)
                await wait(10000);
                await interaction.deleteReply();

            break;
            }
        }
};

