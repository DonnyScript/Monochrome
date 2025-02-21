const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Toggle server mute for a member (Bot owner only)')
    .addStringOption(option =>
      option.setName('target')
        .setDescription('The member to toggle mute')
        .setAutocomplete(true)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(0)
    .setDMPermission(false),

  async execute(interaction) {
    if (interaction.user.id !== '418235415665836033') {
      return interaction.reply({ content: "You do not have permission to use this command!", ephemeral: true });
    }

    const targetId = interaction.options.getString('target');

    let member;
    try {
      member = await interaction.guild.members.fetch(targetId);
    } catch (error) {
      return interaction.reply({ content: "Member not found.", ephemeral: true });
    }

    if (!member.voice.channel) {
      return interaction.reply({ content: `${member.displayName} is not in a voice channel.`, ephemeral: true });
    }

    const isMuted = member.voice.serverMute;
    try {
      await member.voice.setMute(!isMuted, `${isMuted ? 'Unmuted' : 'Muted'} by bot owner: ${interaction.user.tag}`);
      return interaction.reply({
        content: `${member.displayName} has been ${isMuted ? 'unmuted' : 'server muted'}.`
      });
    } catch (error) {
      console.error("Error toggling mute:", error);
      return interaction.reply({ content: "Failed to toggle mute status.", ephemeral: true });
    }
  },

  async autocomplete(interaction) {
    let members = await interaction.guild.members.fetch();
    const focusedValue = interaction.options.getFocused();
    const choices = members.map(member => ({
      name: member.displayName || member.user.tag, 
      value: member.id
    }));
    const filtered = choices.filter(choice =>
      choice.name.toLowerCase().startsWith(focusedValue.toLowerCase())
    ).slice(0, 25);
    await interaction.respond(filtered);
  }
};
