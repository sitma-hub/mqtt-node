const mqtt = require("mqtt");
const Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO


let mqttClient = null;
connectToBroker = () => {
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
      console.log("Reconnecting counter...");
    });
  
    mqttClient.on("connect", () => {
      console.log("Client connected:" + clientId);
    });

    mqttClient.on("message", (topic, message, packet) => {
      // console.log(
      //   "Received Message: " + message.toString() + "\nOn topic: " + topic
      // );
      if (message.toString() === 'INCREMENT') {
        counterValue++;
        mqttClient.publish('sensors/' + iotID + '/counter', String(counterValue), {});
      } else if (message.toString() === 'DECREMENT') {
        counterValue--;
        mqttClient.publish('sensors/' + iotID + '/counter', String(counterValue), {});
      } else if (message.toString() === 'RESET') {
        counterValue = 0;
        mqttClient.publish('sensors/' + iotID + '/counter', String(counterValue), {});
      }
    });

    mqttClient.subscribe('cmd/sensors/' + iotID + '/#', { qos: 0 });
  
}

connectToBroker()

const curPin = 17;
var pushButton = new Gpio(curPin, 'in', 'rising');


pushButton.watch(function () { //Watch for hardware interrupts on pushButton GPIO, specify callback function
  if (mqttClient) {
    counterValue++;
    mqttClient.publish('sensors/' + iotID + '/counter', String(counterValue), {});
  }
});


module.exports = {};