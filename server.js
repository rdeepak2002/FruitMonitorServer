const util = require('util');
const fs = require('fs');
const TrainingApi = require("@azure/cognitiveservices-customvision-training");
const PredictionApi = require("@azure/cognitiveservices-customvision-prediction");
const msRest = require("@azure/ms-rest-js");

const { EventHubConsumerClient } = require("@azure/event-hubs");

// If using websockets, uncomment the following require statement
// const WebSocket = require("ws");

// If you need proxy support, uncomment the below code to create proxy agent
// const HttpsProxyAgent = require("https-proxy-agent");
// const proxyAgent = new HttpsProxyAgent(proxyInfo);

// Event Hub-compatible endpoint
// az iot hub show --query properties.eventHubEndpoints.events.endpoint --name {your IoT Hub name}
const eventHubsCompatibleEndpoint = "sb://ihsuprodblres054dednamespace.servicebus.windows.net/";

// Event Hub-compatible name
// az iot hub show --query properties.eventHubEndpoints.events.path --name {your IoT Hub name}
const eventHubsCompatiblePath = "iothub-ehub-fruithub-11240618-c3fa7f04ea";

// Primary key for the "service" policy to read messages
// az iot hub policy show --name service --query primaryKey --hub-name {your IoT Hub name}
const iotHubSasKey = "6YX/DiJYZRJrcacBH2sOiDdL5hjgS0d9RJv42/Z6pqo=";

// If you have access to the Event Hub-compatible connection string from the Azure portal, then
// you can skip the Azure CLI commands above, and assign the connection string directly here.
const connectionString = `Endpoint=${eventHubsCompatibleEndpoint};EntityPath=${eventHubsCompatiblePath};SharedAccessKeyName=service;SharedAccessKey=${iotHubSasKey}`;

var printError = function (err) {
    console.log(err.message);
  };
  
  // Display the message content - telemetry and properties.
  // - Telemetry is sent in the message body
  // - The device can add arbitrary properties to the message
  // - IoT Hub adds system properties, such as Device Id, to the message.
  var printMessages = function (messages) {
    for (const message of messages) {
      console.log("Telemetry received: ");
      console.log(JSON.stringify(message.body));
      console.log("Properties (set by device): ");
      console.log(JSON.stringify(message.properties));
      console.log("System properties (set by IoT Hub): ");
      console.log(JSON.stringify(message.systemProperties));
      console.log("");
    }
  };
  
  async function main() {
    console.log("IoT Hub Quickstarts - Read device to cloud messages.");
  
    // If using websockets, uncomment the webSocketOptions below
    // If using proxy, then set `webSocketConstructorOptions` to { agent: proxyAgent }
    // You can also use the `retryOptions` in the client options to configure the retry policy
    const clientOptions = {
      // webSocketOptions: {
      //   webSocket: WebSocket,
      //   webSocketConstructorOptions: {}
      // }
    };
  
    // Create the client to connect to the default consumer group of the Event Hub
    const consumerClient = new EventHubConsumerClient("$Default", connectionString, clientOptions);
  
    // Subscribe to messages from all partitions as below
    // To subscribe to messages from a single partition, use the overload of the same method.
    consumerClient.subscribe({
      processEvents: printMessages,
      processError: printError,
    });
  }
  
  main().catch((error) => {
    console.error("Error running sample:", error);
  });
  