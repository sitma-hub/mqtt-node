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
      const messageJson = JSON.parse(message.toString());
      if (disconnectTimeout) {
        clearTimeout(disconnectTimeout);
      }
      if (messageJson.clientId === iotClientConnected || !iotClientConnected) {
        if (!iotClientConnected) {
          iotClientConnected = messageJson.clientId;
        }
        if (messageJson.cmd === 'INCREMENT') {
          counterValue++;
          mqttClient.publish('sensors/' + iotID + '/counter', String(counterValue), {});
          // console.log('Counter INCREMENT: ' + counterValue);
        } else if (messageJson.cmd === 'DECREMENT') {
          if (counterValue > 0) {
            counterValue--;
          }
          mqttClient.publish('sensors/' + iotID + '/counter', String(counterValue), {});
          // console.log('Counter DECREMENT: ' + counterValue);
        } else if (messageJson.cmd === 'RESET') {
          counterValue = 0;
          mqttClient.publish('sensors/' + iotID + '/counter', String(counterValue), {});
          // console.log('Counter RESET: ' + counterValue);
        }
        // console.log('successfully connected', counterValue);
      }
      disconnectTimeout = setTimeout(() => {
        iotClientConnected = null;
      }, 1000);
    });

    mqttClient.subscribe('cmd/sensors/' + iotID + '/#', { qos: 0 });
  
}

connectToBroker()

const curPin = 17;
var pushButton = new Gpio(curPin, 'in', 'rising');


pushButton.watch(function () { 
  if (mqttClient) {
    counterValue++;
    // console.log('Counter value111: ' + counterValue);
    mqttClient.publish('sensors/' + iotID + '/counter', String(counterValue), {});
  }
});


module.exports = {};