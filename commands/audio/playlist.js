const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
const YouTube = require("youtube-sr").default;
const userDataPath = path.join(__dirname, '..', '..', 'userdata', 'playlists.json');
const { useMainPlayer } = require('discord-player');


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
            choices = ['Add Song', 'Create', 'Delete Song', 'Display', 'play'];
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

            switch (option) {
                case 'add song': 
                try {
                    let url = data;
                    let videoUrl = await YouTube.search(url)

                    addLinkToPlaylist(playlistName, videoUrl[0].url);
                    await interaction.reply(`Adding: ${videoUrl[0].title} to ${playlistName}`);
                } catch (error) {
                    await interaction.reply(`Can not add song because: ${error}`)
                }
                    break;
    
                case 'create':
                    createPlaylist(data);
                    await interaction.reply(`Creating a new playlist: ${data}`);
                    break;
    
                case 'delete song':
                    const specificPlaylist = playlists.find(p => p.name === playlistName);
                    const selectOptions = specificPlaylist.links.map(playlistTitle => {
                        return new StringSelectMenuOptionBuilder()
                            .setLabel(playlistTitle.title)
                            .setValue(playlistTitle.title);
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
                        console.log(confirmation.values[0]);
                        deleteFromPlaylist(confirmation.values[0], playlistName);
    
                        await confirmation.reply(`Deleted link with title "${confirmation.values[0]}" from playlist "${playlistName}".`);
                    } catch (error) {
                        await interaction.reply(`Error collecting: ${error}`);
                    }
                    break;
    
                case 'display':
                    const playlist = playlists.find(p => p.name === playlistName);
    
                    if (playlist && Array.isArray(playlist.links) && playlist.links.length > 0) {
                        let test = await displayPlaylist(playlistName, playlists);
                        await interaction.reply(test);
                    } else {
                        await interaction.reply(`Playlist: ${playlistName} has no links.`);
                    }
                    break;
                case 'play':
                    try {
                        const specificPlaylist = playlists.find(p => p.name === playlistName);
                        specificPlaylist.links.forEach(async (link) => {
                            const {track } = await player.play(channel,link.url)
                          });
                        await interaction.reply(`Added playlist: ${specificPlaylist.name} to the queue`)
                    } catch (error) {

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
        console.log(playlist.links[0].title);
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
async function addLinkToPlaylist(playlistName, youtubeURL) {
    try {
        let playlists = [];

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

        const linkNumber = playlist.links.length + 1;

        try {
            const videoTitle = (await YouTube.getVideo(youtubeURL)).title;
            playlist.links.push({ number: linkNumber, url: youtubeURL, title: videoTitle });
        } catch (error) {
            console.error(`Error fetching title for URL ${youtubeURL}:`, error);
            playlist.links.push({ number: linkNumber, url: youtubeURL, title: 'Title not available' });
        }

        await fs.writeFile(userDataPath, JSON.stringify(playlists, null, 2));
    } catch (error) {
        console.error(`Error adding link to "${playlistName}" playlist:`, error);
    }
}

async function deleteFromPlaylist(title, playlistName) {
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
        const linkIndex = playlist.links.findIndex(link => link.title === title);
        if (linkIndex === -1) {
            console.error(`Link with title "${title}" not found in playlist "${playlistName}".`);
            return;
        }

        playlist.links.splice(linkIndex, 1);

        await fs.writeFile(userDataPath, JSON.stringify(playlists, null, 2));
        console.log(`Link with title "${title}" deleted from playlist "${playlistName}".`);
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
