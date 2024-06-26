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
      let ch;
      if (typ=='audioonly') {ch = 'mp3';} else {ch = 'mp4';}

      await interaction.deferReply();
      const videoInfo = await ytdl.getInfo(url).catch((error) => {
        console.error(`Error in getting video info: ${error.message}`);
        throw new Error('Error getting video info.');
      });

      const videoTitle = videoInfo.videoDetails.title;
      
      const videoStream = ytdl(url, { filter: typ }).on('error', (err) => {
        console.error(`Error in download stream: ${err.message}`);
        interaction.followUp('Error downloading video.');
      });

      const bufferStream = new Readable();
      bufferStream.push(await streamToBuffer(videoStream));
      bufferStream.push(null);

      const attachment = new AttachmentBuilder(bufferStream, {name:`${videoTitle}.${ch}`});


      await interaction.followUp({ files: [attachment] });

    } catch (error) {
      console.error(error);
      await interaction.followUp('Error');
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