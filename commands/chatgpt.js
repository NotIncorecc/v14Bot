const { SlashCommandBuilder } = require('discord.js');

const { Configuration, OpenAIApi} = require('openai');
require('dotenv').config();
		

module.exports = {
	data: new SlashCommandBuilder()
		.setName('chatgpt')
		.setDescription('model is text-davinci')
        .addStringOption(option =>
            option.setName('prompt')
            .setDescription('Enter the prompt you want chatgpt to build on')
            .setRequired(true)),
        
	async execute(interaction) {	
		const configuration = new Configuration({
			apiKey: process.env.key
		});

		const openai = new OpenAIApi(configuration);

        const promt = interaction.options.getString('prompt');

        await interaction.deferReply();

		const completion = await openai.createCompletion({
				model: 'text-davinci-003',
				prompt: promt
		});
		const repl =  completion.data.choices[0].text;
		console.log(completion.data.choices);

		await interaction.reply(`${repl}`);
	},
};

/* 
const { Configuration, OpenAIApi} = require('openai');
require('dotenv').config();

const configuration = new Configuration({
    apiKey: process.env.key
});

const openai = new OpenAIApi(configuration);

theprompt = 'How are you today?';

async function runCompletion() {
    const completion = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: theprompt
    });
    console.log(completion.data.choices);
}

runCompletion();
*/