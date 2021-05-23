const { EventHubConsumerClient } = require("@azure/event-hubs");

const eventHubsCompatibleEndpoint = "sb://ihsuprodblres054dednamespace.servicebus.windows.net/";
const eventHubsCompatiblePath = "iothub-ehub-fruithub-11240618-c3fa7f04ea";
const iotHubSasKey = "6YX/DiJYZRJrcacBH2sOiDdL5hjgS0d9RJv42/Z6pqo=";
const connectionString = `Endpoint=${eventHubsCompatibleEndpoint};EntityPath=${eventHubsCompatiblePath};SharedAccessKeyName=service;SharedAccessKey=${iotHubSasKey}`;

var printError = function (err) {
    console.log(err.message);
  };

  var printMessages = function (messages) {
    for (const message of messages) {
    //   console.log("Telemetry received: ");
      console.log(message.body.imageUrl);

      console.log();

    //   const data = JSON.parse(message.body);
    //   console.log(data);
    //   console.log("Properties (set by device): ");
    //   console.log(JSON.stringify(message.properties));
    //   console.log("System properties (set by IoT Hub): ");
    //   console.log(JSON.stringify(message.systemProperties));
    //   console.log("");
      console.log();
    }
  };
  
  async function main() {
    console.log("IoT Hub Quickstarts - Read device to cloud messages.");
  
    const clientOptions = {};
    const consumerClient = new EventHubConsumerClient("$Default", connectionString, clientOptions);
  
    consumerClient.subscribe({
      processEvents: printMessages,
      processError: printError,
    });
  }
  
  main().catch((error) => {
    console.error("Error running sample:", error);
  });
  