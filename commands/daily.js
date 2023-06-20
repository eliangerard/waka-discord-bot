const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('day')
        .setDescription('Sends the current day progress'),
    async execute(interaction, client) {
        const fields = await client.fetchDailyProgress();

        const embed = new EmbedBuilder()
            .setTitle("Resumen de hoy")
            .setColor("#def0d6")
            .addFields(fields);

        interaction.editReply({ embeds: [embed] }).then(msg => {
            setTimeout(() => msg.delete(), 15000)
        });

    },
};