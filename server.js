const { EventHubConsumerClient } = require("@azure/event-hubs");

const eventHubsCompatibleEndpoint = "sb://ihsuprodblres054dednamespace.servicebus.windows.net/";
const eventHubsCompatiblePath = "iothub-ehub-fruithub-11240618-c3fa7f04ea";
const iotHubSasKey = "6YX/DiJYZRJrcacBH2sOiDdL5hjgS0d9RJv42/Z6pqo=";
const connectionString = `Endpoint=${eventHubsCompatibleEndpoint};EntityPath=${eventHubsCompatiblePath};SharedAccessKeyName=service;SharedAccessKey=${iotHubSasKey}`;

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const bodyParser = require("body-parser");
const cors = require("cors");
const dbConfig = require("./app/config/db.config");

const { Server } = require("socket.io");

const corsOptions = {
    origin: "*"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

const db = require("./app/models");
const Role = db.role;

const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

db.mongoose
  .connect(`${dbConfig.HOST}${dbConfig.PASSWORD}@${dbConfig.CLUSTER}/${dbConfig.DB}?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

var printError = function (err) {
    console.log(err.message);
};

var printMessages = function (messages) {
    for (const message of messages) {
        const predictionObject = {};

        predictionObject.deviceId = message.body.deviceInfo.id;
        predictionObject.ownerId = message.body.deviceInfo.owner;
        predictionObject.good = message.body.predictions[1];
        predictionObject.bad = message.body.predictions[0];
        predictionObject.time = Date.now();
        
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

// routes
app.get('/', (req, res) => {
    res.send('<h1>Hello... please leave :)</h1>');
});
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);

io.on('connection', (socket) => {
    // console.log('user connected');

    socket.on('pairRequest', (data) => {
        console.log("pair request: " + data.deviceId);
        socket.broadcast.emit('pairRequest', data);
    });

    socket.on('devicePaired', (data) => {
        console.log("device paired: " + data.id);
        socket.broadcast.emit('devicePaired', data);
    });
});

server.listen(5000, () => {
    console.log('listening on *:5000');

    main().catch((error) => {
        console.error("Error running sample:", error);
    });
});

function initial() {
    Role.estimatedDocumentCount((err, count) => {
      if (!err && count === 0) {
        new Role({
          name: "user"
        }).save(err => {
          if (err) {
            console.log("error", err);
          }
  
          console.log("added 'user' to roles collection");
        });
      }
    });
  }