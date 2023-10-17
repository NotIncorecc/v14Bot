/* eslint-disable no-unused-vars */
const { SlashCommandBuilder} = require('discord.js');
const {joinVoiceChannel, createAudioResource, createAudioPlayer,getVoiceConnection, AudioPlayerStatus} = require('@discordjs/voice');
const fs = require('fs');

const audio = new Map();

const ytse = require('yt-search');
const ytdl = require('ytdl-core');

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
            if (interaction.options.getSubcommand() === 'search')  {
                const given_song = interaction.options.getString('query');
                await interaction.deferReply();

                const search = await ytse(given_song);
                const search_res = search.videos[0].url;
    
                const userchannelid = interaction.member.voice.channelId;
                if (!userchannelid) {return interaction.followUp('You must be in a voice channel to use this command');}
    
                const audioplayer = createAudioPlayer();
    
                const connection = joinVoiceChannel({
                    channelId:userchannelid,
                    guildId:interaction.guildId,
                    adapterCreator:interaction.guild.voiceAdapterCreator
                });
    
                connection.subscribe(audioplayer);
    
                const ytdlprocess = ytdl(search_res, {filter:'audioonly'});
                ytdlprocess.on("error",(error) => {console.error(error);});
                
                audioplayer.play(createAudioResource(ytdlprocess));

                audio.set('music',audioplayer);

                await interaction.followUp({content:'Song is playing'});
    
                audioplayer.on(AudioPlayerStatus.Idle, (oldState, newState) => {//song ended
                    connection.destroy();
                    return interaction.followUp({content:'Song ended. Leaving channel'});
                });

            } else if (interaction.options.getSubcommand() === 'leave') {

                const con = getVoiceConnection(interaction.guildId);
                con.destroy();
                interaction.reply({content:'Leaving Channel X('});

            } else if (interaction.options.getSubcommand() === 'pause') {

                try {audio.get('music').pause(); interaction.reply({content:'Song paused'});} catch (error) {interaction.followUp({content:'Error in pausing'});}

            } else if (interaction.options.getSubcommand() === 'unpause') {

                try {audio.get('music').unpause(); interaction.reply({content:'Song unpaused'});} catch (error) {interaction.followUp({content:'Error in unpausing'});}
            }

        } catch (error){
            console.error(error);

            return interaction.followUp({content:'Oops error'});

        }
	},
};