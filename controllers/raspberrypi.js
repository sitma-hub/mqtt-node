const mqtt = require("mqtt");
const Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO

const curPin = 26;
const LED = new Gpio(curPin, 'out'); 

function setLED(value) {
    LED.writeSync(value)
}

function connectToBroker() {
    const clientId = "client" + Math.random().toString(36).substring(7);
  
    // Change this to point to your MQTT broker
    const host = "wss://192.168.101.189:9001/mqtt";
  
    const options = {
      keepalive: 60,
      clientId: clientId,
      protocolId: "MQTT",
      protocolVersion: 4,
      clean: true,
      reconnectPeriod: 1000,
      connectTimeout: 30 * 1000,
    };
  
    mqttClient = mqtt.connect(host, options);
  
    mqttClient.on("error", (err) => {
      console.log("Error: ", err);
      mqttClient.end();
    });
  
    mqttClient.on("reconnect", () => {
      console.log("Reconnecting raspberry...");
    });
  
    mqttClient.on("connect", () => {
      console.log("Client connected:" + clientId);
    });
  
    // Received
    mqttClient.on("message", (topic, message, packet) => {
      console.log(
        "Received Message: " + message.toString() + "\nOn topic: " + topic
      );
      setLED(message.toString() === 'ON' ? 1 : 0)
    });
    subscribeToTopic();
}
  
function subscribeToTopic() {
    mqttClient.subscribe('b', { qos: 0 });
}
connectToBroker()

module.exports = {};