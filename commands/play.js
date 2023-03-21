/* eslint-disable no-unused-vars */
const { SlashCommandBuilder} = require('discord.js');
const {joinVoiceChannel, createAudioResource, createAudioPlayer, AudioPlayerStatus} = require('@discordjs/voice');
const ytdl = require("ytdl-core");
const ytse = require('yt-search');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Searches from youtube.')
        .addStringOption(option =>
            option.setName('query')
            .setDescription('Name of the video you want to search for')
            .setRequired(true))
        ,

        
	async execute(interaction) {
		// interaction.guild is the object representing the Guild in which the command was run
        const given_song = interaction.options.getString('query');

        try{
            await interaction.deferReply();

            const search = await ytse(given_song);
            const search_res = search.videos[0].url;

            const userchannel = interaction.member.voice;
            if (!userchannel) {return interaction.followUp('You must be in a voice channel to use this command');}

            const audioplayer = createAudioPlayer();

            const connection = joinVoiceChannel({
                channelId:userchannel.channelId,
                guildId:interaction.guildId,
                adapterCreator:interaction.guild.voiceAdapterCreator
            });

            connection.subscribe(audioplayer);

            const ytdlprocess = ytdl(search_res, {filter:'audioonly'});

            ytdlprocess.on("error",(error) => {console.error(error);});

            audioplayer.play(createAudioResource(ytdlprocess));

            await interaction.followUp({content:'Song is playing'});

            audioplayer.on(AudioPlayerStatus.Idle, (oldState, newState) => {//song ended
                connection.destroy();
                return interaction.followUp({content:'Song ended. Leaving channel'});
            });

        } catch (error){
            console.error(error);

            return interaction.followUp({content:'Oops error'});

        }
	},
};