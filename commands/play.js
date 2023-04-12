/* eslint-disable no-unused-vars */
const { SlashCommandBuilder} = require('discord.js');
const {joinVoiceChannel, createAudioResource, createAudioPlayer,getVoiceConnection, AudioPlayerStatus, getVoiceConnections} = require('@discordjs/voice');
const {stream} = require("play-dl");

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
            .setDescription('The bot stops the music and leaves the channel')
            )

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
                    adapterCreator:interaction.guild.voiceAdapterCreator
                });

                connection.subscribe(audioplayer);

                const playprocess = await stream(search_res);

                audioplayer.play(createAudioResource(playprocess.stream, {inputType:playprocess.type} ));

                audioplayer.on('error', error => {
                    console.error(`Error: ${error.message} with resource....`);
                });

                audioplayer.on(AudioPlayerStatus.Idle, (oldState, newState) => {//song ended
                    audioplayer.stop();
                    connection.destroy();
                    return interaction.followUp({content:'Song ended. Leaving channel X('});
                });

                
                await interaction.followUp({content:'Song is playing'});
            } else if (interaction.options.getSubcommand() === 'leave') {
                const con = getVoiceConnection(interaction.guildId);
                con.destroy();
                interaction.followUp({content:'Leaving Channel X('});
        }

        } catch (error){
            console.error(error);

            return interaction.followUp({content:'Oops error'});

        }
	},
};