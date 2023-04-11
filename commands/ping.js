const { SlashCommandBuilder} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Classic ping command.'),
        
	async execute(interaction) {
		await interaction.reply(`${interaction.user.username} used this ping command`);
	},
};