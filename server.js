const { EventHubConsumerClient } = require("@azure/event-hubs");

const eventHubsCompatibleEndpoint = "sb://ihsuprodblres054dednamespace.servicebus.windows.net/";
const eventHubsCompatiblePath = "iothub-ehub-fruithub-11240618-c3fa7f04ea";
const iotHubSasKey = "6YX/DiJYZRJrcacBH2sOiDdL5hjgS0d9RJv42/Z6pqo=";
const connectionString = `Endpoint=${eventHubsCompatibleEndpoint};EntityPath=${eventHubsCompatiblePath};SharedAccessKeyName=service;SharedAccessKey=${iotHubSasKey}`;

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");

const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

var printError = function (err) {
    console.log(err.message);
};

var printMessages = function (messages) {
    for (const message of messages) {
        console.log(message.body.imageUrl);
        console.log();
        io.sockets.emit('iotMessage', message.body);
    }
};

async function main() {
    console.log("IoT Hub Quickstarts - Read device to cloud messages.");

    const clientOptions = {};
    const consumerClient = new EventHubConsumerClient("$Default", connectionString, clientOptions);

    consumerClient.subscribe({
        processEvents: printMessages,
        processError: printError
    });
}

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});

io.on('connection', (socket) => {
    console.log('user connected');
});

server.listen(5000, () => {
    console.log('listening on *:5000');

    main().catch((error) => {
        console.error("Error running sample:", error);
    });
});