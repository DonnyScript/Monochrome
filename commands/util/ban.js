const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member (Bot owner only)')
    .addStringOption(option =>
      option.setName('target')
        .setDescription('The member to ban')
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
      console.error("Error fetching the member from the guild:", error);
      return interaction.reply({ content: "Failed to fetch the member from the guild.", ephemeral: true });
    }

    if (!member) {
      return interaction.reply({ content: "Member not found in this guild.", ephemeral: true });
    }

    const botMember = await interaction.guild.members.fetch(interaction.client.user.id);

    if (!botMember.permissions.has('BAN_MEMBERS')) {
      return interaction.reply({ content: "I don't have permission to ban members.", ephemeral: true });
    }

    if (member.roles.highest.position >= botMember.roles.highest.position) {
      return interaction.reply({ content: "I can't ban this member due to role hierarchy.", ephemeral: true });
    }

    try {
      await member.ban({ reason: `Banned by bot owner: ${interaction.user.tag}` });
      return interaction.reply({ content: `Successfully banned ${member.user.tag}` });
    } catch (error) {
      console.error("Error banning member:", error);
      return interaction.reply({ content: "Failed to ban the member.", ephemeral: true });
    }
  },

  async autocomplete(interaction) {
    let members;
    try {
      members = await interaction.guild.members.fetch();
    } catch (error) {
      console.error("Error fetching members for autocomplete:", error);
      return;
    }

    const focusedValue = interaction.options.getFocused();
    const choices = members
      .filter(member => !member.user.bot)
      .map(member => ({
        name: `${member.user.tag}`,
        value: member.id
      }));

    const filtered = choices.filter(choice =>
      choice.name.toLowerCase().startsWith(focusedValue.toLowerCase())
    ).slice(0, 25);

    await interaction.respond(filtered);
  },
};
