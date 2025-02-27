const { SlashCommandBuilder } = require('@discordjs/builders');
const { spawn } = require('child_process');

function cleanOutput(output) {
    return output.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '').trim();
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chat')
        .setDescription('Send a message to Monochrome')
        .addStringOption(option =>
            option.setName('input')
                .setDescription('message')
                .setRequired(true)),
    async execute(interaction) {
        const userInput = interaction.options.getString('input');

        await interaction.deferReply();

        const powershellPath = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
        const command = 'ollama run mistral-nemo';
        const childProcess = spawn(powershellPath, ['-Command', command]);

        let output = '';

        childProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        childProcess.on('close', (code) => {
            if (code !== 0) {
                interaction.editReply('An error occurred while executing the command.');
                return;
            }

            const cleanedOutput = cleanOutput(output);

            if (cleanedOutput) {
                interaction.editReply(cleanedOutput);
            } else {
                interaction.editReply('No meaningful output was returned from the command.');
            }
        });

        childProcess.stdin.write(`${userInput}\n`);
        childProcess.stdin.end();
    },
};
