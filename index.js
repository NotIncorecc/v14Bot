// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds], rest: 600000 });

//the collection
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands'); //path of the commands folder
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));  // this will be an array of names of the files in commands folder

for (const file of commandFiles) {  //for every file
	const filePath = path.join(commandsPath, file);   //path of that file 
	const command = require(filePath);  //  get file that object
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);  // dump it in collection with name of the command as key( data.name )
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);  //foff otherwise
	}
}

const eventsPath = path.join(__dirname, 'events');//path of the commands folder
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js')); // this will be an array of names of the files in events folder


for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath); //requiring each event
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args)); //if the event is a once event like 'ready'
	} else {
		client.on(event.name, (...args) => event.execute(...args));  // like 'interactionCreate'
	}
}

// Log in to Discord with your client's token
client.login(process.env.token);