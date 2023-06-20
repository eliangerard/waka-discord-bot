const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require("discord.js");
const fs = require('node:fs');

const responseToJson = (response) => {
    const pairs = response.split('&');
    const json = {};
    pairs.forEach(pair => {
        const [key, value] = pair.split('=');
        json[key] = decodeURIComponent(value);
    });
    return json;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('code')
        .setDescription('Add your grant code to finish the vinculation process')
        .addStringOption(option => option.setName('code').setDescription('Your grant code').setRequired(true)),
    async execute(interaction, client) {
        const grant = interaction.options.getString('code');
        const { client_id, client_secret, redirect_uri, scope } = client.waka_params;

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
        myHeaders.append("Cookie", "session=eyJ1dG1fc291cmNlcyI6e30sIm9yaWdfcmVmZXJyZXIiOm51bGwsIl9mcmVzaCI6ZmFsc2V9.ZI4cEg.gqQA7Oa7twKFJU-9LXv1vfe5X8I");

        var urlencoded = new URLSearchParams();
        urlencoded.append("client_id", client_id);
        urlencoded.append("client_secret", client_secret);
        urlencoded.append("redirect_uri", redirect_uri);
        urlencoded.append("grant_type", "authorization_code");
        urlencoded.append("code", grant);

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: urlencoded,
            redirect: 'manual'
        };

        const loginData = await fetch("https://wakatime.com/oauth/token", requestOptions)
            .then(response => response.text())
            .then(result => responseToJson(result))
            .catch(error => console.log('error', error));

        loginData.discord_id = interaction.user.id;

        console.log(loginData);

        let data = JSON.parse(fs.readFileSync('users.json'));
        data.push(loginData)
        console.log(data);

        fs.writeFileSync('users.json', JSON.stringify(data));

        const embed = new EmbedBuilder()
            .setTitle("¡Cuenta vinculada!")
            .setColor("#def0d6");

        interaction.editReply({ embeds: [embed] }).then(msg => {
            setTimeout(() => msg.delete(), 15000)
        });

    },
};