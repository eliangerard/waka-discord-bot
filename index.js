const fs = require('node:fs');
const path = require('node:path');
const schedule = require("node-schedule");
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { EmbedBuilder, TextChannel } = require("discord.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });
client.config = require("./config.json")
client.waka_params = client.config.waka_params;

const getFiles = (dirName) => {
    let files = [];
    const items = fs.readdirSync(dirName, { withFileTypes: true });

    items.forEach(item => {
        if (item.isDirectory()) {
            files = [
                ...files.filter(file => file.endsWith('.js')),
                ...(getFiles(`${dirName}/${item.name}`)),
            ];
        } else {
            files.push(`${dirName}/${item.name}`);
        }
    })

    return files;
};


client.commands = new Collection();
const commandFiles = getFiles('commands');
console.log(commandFiles);

commandFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
});

const eventsPath = path.join(__dirname, 'events/discord');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
eventFiles.forEach(file => {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
});

client.fetchDailyProgress = async () => {
    const usersData = JSON.parse(fs.readFileSync('users.json'));
    console.log(usersData);
    let fields = [];
    for (let i = 0; i < usersData.length; i++) {
        let myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer " + usersData[i].access_token);

        let requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'manual'
        };

        const { cumulative_total } = await fetch("https://wakatime.com/api/v1/users/current/summaries?start=today&end=today", requestOptions)
            .then(response => response.json())
            .then(result => result)
            .catch(error => console.log('error', error));

        fields.push({
            name: ` `,
            value: '<@'+usersData[i].discord_id+'> - `' + cumulative_total.text +'`',
        });
    }
    return fields;
}

client.dayProgress = async () => {
    const fields = await client.fetchDailyProgress();

    const servidor = await client.guilds.fetch(client.config.server);
    console.log(servidor);

    const channel = servidor.channels.cache.get(client.config.channel);

    console.log(channel);
    if (channel instanceof TextChannel) {
        const embed = new EmbedBuilder()
            .setTitle("Resumen de hoy")
            .setColor("#def0d6")
            .addFields(fields);

        channel.send({ embeds: [embed] });
    }
}

const job = schedule.scheduleJob("0 0 * * *", client.dayProgress);

client.login(client.config.token);