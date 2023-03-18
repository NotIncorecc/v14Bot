const { SlashCommandBuilder, AttachmentBuilder} = require('discord.js');
const ytdl = require('ytdl-core');
const { Readable } = require('stream');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('download')
		.setDescription('Downloads audio or video from the internet')
    .addStringOption(option =>
      option.setName('ytlink')
      .setDescription('Enter the link of the yt')
      .setRequired(true))
    .addStringOption(option =>
        option.setName('type')
          .setDescription('The type')
          .setRequired(true)
          .addChoices(
            { name: 'onlyaudio', value: 'audioonly' },
            { name: 'onlyvideo', value: 'videoonly' },
            { name: 'both(mp4)', value: 'audioandvideo' },
          )),
        
	async execute(interaction) {
    
    try {
      const url = interaction.options.getString('ytlink');
      const typ = interaction.options.getString('type');

      await interaction.deferReply();
      const videoInfo = await ytdl.getBasicInfo(url);
      const videoTitle = videoInfo.videoDetails.title;
      const videoStream = ytdl(url, { filter: typ });

      const bufferStream = new Readable();
      bufferStream.push(await streamToBuffer(videoStream));
      bufferStream.push(null);

      const attachment = new AttachmentBuilder(bufferStream, {name:`${videoTitle}.mp4`});


      await interaction.followUp({ files: [attachment] });
      await interaction.followUp( { content:'If you used mp4 format keep in mind that the audio may not play in discord. Audio will be available once you download'});

    } catch (error) {
      console.error(error);
      await interaction.followUp('Error downloading video.');
    }  
    
      
    },
};

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => {
      chunks.push(chunk);
    });
    stream.on('end', () => {
      const buffer = Buffer.concat(chunks);
      resolve(buffer);
    });
    stream.on('error', (error) => {
      reject(error);
    });
  });
}