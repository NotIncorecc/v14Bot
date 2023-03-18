const { SlashCommandBuilder} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Classic ping command.'),
        
	async execute(interaction) {
		// interaction.guild is the object representing the Guild in which the command was run
		await interaction.reply(`${interaction.user.username} used this ping command`);
	},
};