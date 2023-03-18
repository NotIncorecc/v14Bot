module.exports = {
	name: 'guildMemberSpeaking',
	async execute(member, speaking) {
		if (speaking) {console.log(`${member} is speking`);}
	},
};