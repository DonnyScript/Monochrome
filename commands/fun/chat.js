const { SlashCommandBuilder } = require('@discordjs/builders');
const { spawn } = require('child_process');

// Function to clean up control characters from the output
function cleanOutput(output) {
    // Remove ANSI escape codes and trim whitespace
    return output.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '').trim();
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('llama')
        .setDescription('Send a message to the LLM model and get a response.')
        .addStringOption(option =>
            option.setName('input')
                .setDescription('The message to send to the LLM model')
                .setRequired(true)),
    async execute(interaction) {
        const userInput = interaction.options.getString('input');

        // Defer the reply to give time for processing
        await interaction.deferReply();

        // Construct the command to run ollama with the user's input
        const powershellPath = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
        const command = 'ollama run dolphin-llama3:8b';
        const childProcess = spawn(powershellPath, ['-Command', command]);

        let output = '';

        // Listen for data from stdout
        childProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        // Listen for the end of the process
        childProcess.on('close', (code) => {
            if (code !== 0) {
                interaction.editReply('An error occurred while executing the command.');
                return;
            }

            // Clean the output to remove loading animations and other control characters
            const cleanedOutput = cleanOutput(output);

            // Send the cleaned command output as the reply
            if (cleanedOutput) {
                interaction.editReply(cleanedOutput);
            } else {
                interaction.editReply('No meaningful output was returned from the command.');
            }
        });

        // Send the user's input to the LLM model
        childProcess.stdin.write(`${userInput}\n`);
        childProcess.stdin.end();
    },
};
