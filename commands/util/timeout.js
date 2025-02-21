const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout a member for a specific duration (Bot owner only)')
    .addStringOption(option =>
      option.setName('target')
        .setDescription('The member to timeout')
        .setAutocomplete(true)
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('duration')
        .setDescription('Duration in minutes')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(0)
    .setDMPermission(false),

  async execute(interaction) {
    if (interaction.user.id !== '418235415665836033') {
      return interaction.reply({ content: "You do not have permission to use this command!", ephemeral: true });
    }

    const targetId = interaction.options.getString('target');
    const duration = interaction.options.getInteger('duration');
    let member;
    try {
      member = await interaction.guild.members.fetch(targetId);
    } catch (error) {
      return interaction.reply({ content: "Member not found.", ephemeral: true });
    }

    const botMember = await interaction.guild.members.fetch(interaction.client.user.id);
    if (!botMember.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: "I don't have permission to timeout members.", ephemeral: true });
    }

    try {
      await member.timeout(duration * 60 * 1000, `Timed out by bot owner: ${interaction.user.tag}`);
      return interaction.reply({ content: `${member.displayName} has been timed out for ${duration} minutes.` });
    } catch (error) {
      return interaction.reply({ content: "Failed to timeout the member.", ephemeral: true });
    }
  },

  async autocomplete(interaction) {
    let members = await interaction.guild.members.fetch();
    const focusedValue = interaction.options.getFocused();
    const choices = members
      .filter(member => !member.user.bot)
      .map(member => ({
        name: member.displayName || member.user.tag, 
        value: member.id
      }));
    const filtered = choices.filter(choice =>
      choice.name.toLowerCase().startsWith(focusedValue.toLowerCase())
    ).slice(0, 25);
    await interaction.respond(filtered);
  }
};
