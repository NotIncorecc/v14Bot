/* eslint-disable no-unused-vars */
const { SlashCommandBuilder} = require('discord.js');
const {joinVoiceChannel, createAudioResource, createAudioPlayer,getVoiceConnection, AudioPlayerStatus} = require('@discordjs/voice');
const {stream} = require("play-dl");
const audio = new Map();

const ytse = require('yt-search');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Searches from youtube.')
        .addSubcommand(subcommand => subcommand
            .setName('search')
            .setDescription('Enter song you want to search and play in channel')
            .addStringOption(option => option.setName('query').setDescription('name of the song')))
        .addSubcommand(subcommand => subcommand
            .setName('leave')
            .setDescription('The bot stops the music and leaves the channel'))
        .addSubcommand(subcommand => subcommand
            .setName('pause')
            .setDescription('pauses the audio in the voice channel'))
        .addSubcommand(subcommand => subcommand
            .setName('unpause')
            .setDescription('resumes the audio in the voice channel'))

        ,
	async execute(interaction) {
        
        try{
            await interaction.deferReply();

            const userchannel = interaction.member.voice;
            if (!userchannel) {return interaction.followUp('You must be in a voice channel to use this command');}

            if (interaction.options.getSubcommand() === 'search')  {
                const given_song = interaction.options.getString('query');
                const search = await ytse(given_song);
                const search_res = search.videos[0].url;

                const audioplayer = createAudioPlayer();

                const connection = joinVoiceChannel({
                    channelId:userchannel.channelId,
                    guildId:interaction.guildId,
                    adapterCreator:interaction.guild.voiceAdapterCreator,
                    selfDeaf:false
                });

                connection.subscribe(audioplayer);

                const playprocess = await stream(search_res);

                audioplayer.play(createAudioResource(playprocess.stream, {inputType:playprocess.type} ));

                audio.set('music',audioplayer);

                audioplayer.on('error', error => {
                    console.error(`Error: ${error.message} with resource....`);
                });

                audioplayer.on(AudioPlayerStatus.Idle, (oldState, newState) => {//song ended
                    audioplayer.stop();
                    connection.destroy();
                    audio.delete('music');
                    return interaction.followUp({content:'Song ended. Leaving channel X('});
                });

                
                await interaction.followUp({content:'Song is playing'});

            } else if (interaction.options.getSubcommand() === 'leave') {

                const con = getVoiceConnection(interaction.guildId);
                con.destroy();
                interaction.followUp({content:'Leaving Channel X('});

            } else if (interaction.options.getSubcommand() === 'pause') {

                try {audio.get('music').pause(); interaction.followUp({content:'Song paused'});} catch (error) {interaction.followUp({content:'Error in pausing'});}

            } else if (interaction.options.getSubcommand() === 'unpause') {

                try {audio.get('music').unpause(); interaction.followUp({content:'Song unpaused'});} catch (error) {interaction.followUp({content:'Error in unpausing'});}
            }

        } catch (error){
            console.error(error);

            return interaction.followUp({content:'Oops error'});

        }
	},
};