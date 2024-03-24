const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
const userDataPath = path.join(__dirname, '..', '..', 'userdata', 'playlists.json');
const { useMainPlayer } = require('discord-player');
const wait = require('util').promisify(setTimeout);
const { serialize } = require('discord-player');


module.exports = {
    category: 'audio',
    data: new SlashCommandBuilder()
        .setName('playlist')
        .setDescription('Playlist actions')
        .addStringOption(option =>
            option.setName('option')
                .setAutocomplete(true)
                .setDescription('Playlist Action')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('playlist')
                .setDescription('Name of playlist')
                .setAutocomplete(true))
        .addStringOption(option =>
            option.setName('value')
                .setDescription('Enter value')),
    async autocomplete(interaction) {
        const playlistsData = await fs.readFile(userDataPath, 'utf-8');
        const playlists = JSON.parse(playlistsData);
        const focusedOption = interaction.options.getFocused(true);
        let choices = [];

        if (focusedOption.name === 'option') {
            choices = ['Add Song', 'Create', 'Delete Song', 'Display', 'Play',];
        }

        if (focusedOption.name === 'playlist') {
            choices = await getPlaylistNames(playlists);
        }

        const filtered = choices.filter(choice => choice.startsWith(focusedOption.value));
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        );
    },
    async execute(interaction) {
        try {
            const player = useMainPlayer();
            const playlistsData = await fs.readFile(userDataPath, 'utf-8');
            const playlists = JSON.parse(playlistsData);
            const option = interaction.options.getString('option').toLowerCase();
            const data = interaction.options.getString('value');
            const playlistName = interaction.options.getString('playlist');
            const channel = interaction.member.voice.channel;
            let name = interaction.member.user.globalName;

            switch (option) {
                case 'add song': 
                try {
                    if(data == null || playlistName == null){
                        await interaction.reply({content: `${name} did not use the command correctly, thought everyone should know.`, tts:true});
                        await wait(10000);
                        await interaction.deleteReply();gmadon
                        return;
                    }

                    const result = await player.search(data);

                    addSerialLink(playlistName, result._data.tracks[0].url);
                    await interaction.reply(`Adding: ${result._data.tracks[0].title} to ${playlistName}`);
                    await wait(25000);
                    await interaction.deleteReply();

                } catch (error) {
                    await interaction.reply(`Can not add song because: ${error}`)
                }
                    break;
    
                case 'create':
                    if(data == null){
                        await interaction.reply({content: `${name} did not use the command correctly, thought everyone should know.`, tts:true});
                        await wait(10000);
                        await interaction.deleteReply();
                        return;
                    }

                    createPlaylist(data);
                    await interaction.reply(`Creating a new playlist: ${data}`);
                    await wait(25000);
                    await interaction.deleteReply();

                    break;
    
                case 'delete song':
                    const specificPlaylist = playlists.find(p => p.name === playlistName);

                    if(specificPlaylist == null){
                        await interaction.reply({content: `${name} did not use the command correctly, thought everyone should know.`, tts:true});
                        await wait(10000);
                        await interaction.deleteReply();
                        return;
                    }
                    const selectOptions = specificPlaylist.links.map(playlistTitle => {
                        return new StringSelectMenuOptionBuilder()
                            .setLabel(playlistTitle.track.title)
                            .setValue(playlistTitle.track.title);
                    });
    
                    const selectMenu = new StringSelectMenuBuilder()
                        .setCustomId('playlist_select')
                        .setPlaceholder('Select a Song')
                        .addOptions(selectOptions);
    
                    const row = new ActionRowBuilder()
                        .addComponents(selectMenu);
    
                    await interaction.reply({
                        content: 'Choose song to delete:',
                        components: [row],
                    });
    
                    const collectorFilter = i => i.user.id === interaction.user.id;

                    try {
                        const confirmation = await interaction.channel.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
                        serialDelete(confirmation.values[0], playlistName);
                        await confirmation.reply(`Deleted link with title "${confirmation.values[0]}" from playlist "${playlistName}".`);
                    } catch (error) {
                        await interaction.reply(`Error collecting: ${error}`);
                    }

                    break;
    
                case 'display':
                    const playlist = playlists.find(p => p.name === playlistName);

                    if(playlist == null){
                        await interaction.reply({content: `${name} did not use the command correctly, thought everyone should know.`, tts:true});
                        await wait(5000);
                        await interaction.deleteReply();
                        return;
                    }

                    if (playlist && Array.isArray(playlist.links) && playlist.links.length > 0) {
                        let playlistTracks = await serialDisplay(playlistName, playlists);
                        await interaction.reply(playlistTracks);
                        await wait(25000);
                        await interaction.deleteReply();
                    } else {
                        await interaction.reply(`Playlist: ${playlistName} has no links.`);
                        await wait(25000);
                        await interaction.deleteReply();
                    }

                    break;
                case 'play':
                    try {
                        if (!channel) return interaction.followUp('You are not connected to a voice channel!');
                        let playlistQueue = [];
                        const specificPlaylist = playlists.find(p => p.name === playlistName);

                        if(specificPlaylist == null){
                            await interaction.reply({content: `${name} did not use the command correctly, thought everyone should know.`, tts:true});
                            await wait(5000);
                            await interaction.deleteReply();
                            return;
                        }

                        specificPlaylist.links.forEach(async (link) => {
                            playlistQueue.push(link);
                          });

                          shuffle(playlistQueue);

                          playlistQueue.forEach(async (link) => {
                            await player.play(channel,link.track.url)
                          });

                        await interaction.reply(`Added playlist: ${specificPlaylist.name} to the queue`)
                        await wait(25000);
                        await interaction.deleteReply();

                    } catch (error) {
                        await interaction.reply('Error in playing the playlist');
                    }
                break;
                case 'addPlayList':
                    if(data == null || playlistName == null){
                        await interaction.reply({content: `${name} did not use the command correctly, thought everyone should know.`, tts:true});
                        await wait(10000);
                        await interaction.deleteReply();gmadon
                        return;
                    }
                     
                break;
            }
        } catch (error) {
            await interaction.reply(`Error in playlist block: ${error}`);
        }
    },
};    


async function getPlaylistNames(playlists) {
    let choices = [];

    try {
        playlists.forEach(playlist => {
            if ('name' in playlist) {
                choices.push(playlist.name);
            } else {
                console.log(`[WARNING] Playlist object in ${userDataPath} is missing the "name" property.`);
            }
        });
    } catch (error) {
        console.error(`Error reading playlists data: ${error}`);
    }
    return choices;
}

async function displayPlaylist(playlistName, playlists) {
    try {
        const playlist = playlists.find(p => p.name === playlistName);
        if (!playlist) {
            return `Playlist "${playlistName}" not found.`;
        }

        const playlistString = [`Playlist "${playlistName}":`];
        
        for (let i = 0; i < playlist.links.length; i++) {
            const link = playlist.links[i];
            try {
                playlistString.push(`${i + 1}: ${link.title}`);
            } catch (error) {
                console.error(`Error fetching title for URL ${link.url}:`, error);
                playlistString.push(`${i + 1}: ${link.url} (Title not available)`);
            }
        }

        return playlistString.join('\n');
    } catch (error) {
        console.error('Error in displayPlaylist:', error);
        return 'An unexpected error occurred while displaying the playlist.';
    }
}

async function serialDisplay(playlistName, playlists){
    try {
        const playlist = playlists.find(p => p.name === playlistName);
        if (!playlist) {
            return `Playlist "${playlistName}" not found.`;
        }

        const playlistString = [`Playlist "${playlistName}":`];
        
        for (let i = 0; i < playlist.links.length; i++) {
            const link = playlist.links[i];
            try {
                playlistString.push(`${i + 1}: ${link.track.title}`);
            } catch (error) {
                console.error(`Error fetching title for URL ${link.track.url}:`, error);
                playlistString.push(`${i + 1}: ${link.track.url} (Title not available)`);
            }
        }

        return playlistString.join('\n');
    } catch (error) {
        console.error('Error in displayPlaylist:', error);
        return 'An unexpected error occurred while displaying the playlist.';
    }
}

async function addSerialLink(playlistName, newTrack){
    try {
        let playlists = [];
        const player = useMainPlayer();
        const searchResult = await player.search(newTrack);

        if (searchResult.tracks.length === 0) {
            return await interaction.reply('No tracks found.');
        }

        const track = searchResult.tracks[0];
        const serializedTrack = serialize(track);

        try {
            await fs.access(userDataPath); 
            const playlistsContent = await fs.readFile(userDataPath);
            playlists = JSON.parse(playlistsContent);
        } catch (error) {
            console.error('Error reading playlists data:', error);
        }

        const playlist = playlists.find(p => p.name === playlistName);
        if (!playlist) {
            console.error(`Playlist "${playlistName}" not found.`);
            return;
        }

        try {
            playlist.links.push({track: serializedTrack });
        } catch (error) {
            console.error(`Error fetching title for URL ${newTrack}:`, error);
        }

        await fs.writeFile(userDataPath, JSON.stringify(playlists, null, 2));

    } catch (error) {
        console.error(`Error adding link to "${playlistName}" playlist:`, error);
    }

}

async function serialDelete(title, playlistName){
    try {
        let playlists = [];
        try {
            await fs.access(userDataPath);
            const playlistsContent = await fs.readFile(userDataPath);
            playlists = JSON.parse(playlistsContent);
        } catch (error) {
            console.error('Error reading playlists data:', error);
        }

        const playlistIndex = playlists.findIndex(p => p.name === playlistName);
        if (playlistIndex === -1) {
            console.error(`Playlist "${playlistName}" not found.`);
            return;
        }

        const playlist = playlists[playlistIndex];
        const linkIndex = playlist.links.findIndex(link => link.track.title === title);
        if (linkIndex === -1) {
            console.error(`Link with title "${title}" not found in playlist "${playlistName}".`);
            return;
        }
        playlist.links.splice(linkIndex, 1);

        await fs.writeFile(userDataPath, JSON.stringify(playlists, null, 2));
    } catch (error) {
        console.error(`Error deleting link from "${playlistName}" playlist:`, error);
    }
}

async function createPlaylist(playlistName) {
    try {
        let playlists = [];

        try {
            await fs.access(userDataPath); 
            const playlistsContent = await fs.readFile(userDataPath);
            playlists = JSON.parse(playlistsContent);
        } catch (error) {
            console.error('Error reading playlists data:', error);
        }

        if (playlists.find(playlist => playlist.name === playlistName)) {
            console.error(`Playlist "${playlistName}" already exists.`);
            return;
        }

        playlists.push({ name: playlistName, links: [] });

        await fs.writeFile(userDataPath, JSON.stringify(playlists, null, 2));
        console.log(`Playlist "${playlistName}" created successfully.`);
    } catch (error) {
        console.error(`Error creating playlist "${playlistName}":`, error);
    }
}

function shuffle(array) {
    var m = array.length, t, i;
  
    while (m) {
        i = Math.floor(Math.random() * m--);
        t = array[m];
      array[m] = array[i];
      array[i] = t;
    }
  
    return array;
  }