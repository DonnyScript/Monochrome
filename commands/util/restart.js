const { SlashCommandBuilder } = require('@discordjs/builders');
const { exec } = require('child_process');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('restart')
    .setDescription('Restart fren'),

  async execute(interaction) {
    // 1) Immediately reply that we are restarting
    await interaction.reply('BRB!');

    // 2) Execute the PM2 restart command
    exec('pm2 restart Monochrome', (error, stdout, stderr) => {
      if (error) {
        console.error('Error restarting PM2:', error);
        return interaction.followUp({
          content: `**Error restarting PM2**:\n\`\`\`\n${error.message}\n\`\`\``,
        });
      }

      // 3) PM2 restart succeeded - send a follow-up message
      interaction.followUp({
        content: `**PM2 process restarted successfully!**\n\`\`\`\n${stdout || 'No output'}\n\`\`\``,
      });
    });
  },
};

