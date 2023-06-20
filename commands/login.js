const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('login')
		.setDescription('Log in with your Wakatime account to access all the features of the bot.'),
	async execute(interaction, client) {

        const { client_id, response_type, redirect_uri, scope } = client.waka_params;
        const url = `https://wakatime.com/oauth/authorize?client_id=${encodeURIComponent(client_id)}&response_type=${response_type}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=${encodeURIComponent(scope)}`;

		const embed = new EmbedBuilder()
                .setTitle("Vincula tu cuenta")
                .setColor("#def0d6")
                .setDescription(`Haz clic [aquí](${url}) para vincular tu cuenta`);

        interaction.editReply( { embeds: [embed] } ).then(msg => {
            setTimeout(() => msg.delete(), 15000)
        });

	},
};