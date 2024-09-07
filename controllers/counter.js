const mqtt = require("mqtt");
const Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO

function checkIfCounterEqualsMaxValue() {
  // console.log('Counter value: ' + counterValue + ' Max value: ' + maxValue);
  if (counterValue >= maxValue) {
    valveOutput.writeSync(0);
    
    if (countNextTotal) {
      totalCounter++;
      console.log('Valve opened', totalCounter,countNextTotal);
      countNextTotal = false;
    }
  } else {
    valveOutput.writeSync(1);
  }
  mqttClient.publish('sensors/' + iotID + '/total', String(totalCounter), {});
}


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
          checkIfCounterEqualsMaxValue()
          // console.log('Counter INCREMENT: ' + counterValue);
        } else if (messageJson.cmd === 'DECREMENT') {
          if (counterValue > 0) {
            counterValue--;
          }
          mqttClient.publish('sensors/' + iotID + '/counter', String(counterValue), {});
          checkIfCounterEqualsMaxValue()
          // console.log('Counter DECREMENT: ' + counterValue);
        } else if (messageJson.cmd === 'RESET') {
          counterValue = 0;
          mqttClient.publish('sensors/' + iotID + '/counter', String(counterValue), {});
          checkIfCounterEqualsMaxValue()
          // console.log('Counter RESET: ' + counterValue);
        // } else if (messageJson.cmd === 'SET_MAX_VALUE') {
        //   maxValue = messageJson.maxValue;
        //   mqttClient.publish('sensors/' + iotID + '/counter-max-value', String(maxValue), {});
        //   checkIfCounterEqualsMaxValue()
        //   // console.log('Counter SET_MAX_VALUE: ' + maxValue);
        } else if (
          messageJson.cmd === 'SET_TARGET_VALUE'
        ) {
          maxValue = Number(messageJson.value)
          // console.log('Counter SET_TARGET_VALUE: ' + maxValue, messageJson);
          checkIfCounterEqualsMaxValue()
        } else if (messageJson.cmd === 'RESET_TOTAL') {
          totalCounter = 0;
          mqttClient.publish('sensors/' + iotID + '/total', String(totalCounter), {});
          countNextTotal = true;
          // console.log('Total RESET: ' + totalCounter);
        } else if (messageJson.cmd === 'INCREMENT_TOTAL') {
          totalCounter++;
          mqttClient.publish('sensors/' + iotID + '/total', String(totalCounter), {});
          countNextTotal = false;
          // console.log('Total INCREMENT: ' + totalCounter);
        } else if (messageJson.cmd === 'DECREMENT_TOTAL') {
          if (totalCounter > 0) {
            totalCounter--;
          }
          mqttClient.publish('sensors/' + iotID + '/total', String(totalCounter), {});
          countNextTotal = false;
          // console.log('Total DECREMENT: ' + totalCounter);
        }
        // console.log('successfully connected', counterValue);
      }
      if (counterValue === 0) {
        countNextTotal = true;
      }
      disconnectTimeout = setTimeout(() => {
        iotClientConnected = null;
      }, 1000);
    });

    mqttClient.subscribe('cmd/sensors/' + iotID + '/#', { qos: 0 });
  
}

connectToBroker()

const counterPin = 17;
const valvePin = 26;

var pushButton = new Gpio(counterPin, 'in', 'rising', {debounceTimeout: 100});
var valveOutput = new Gpio(valvePin, 'out');
valveOutput.writeSync(1);


pushButton.watch(function () { 
  if (mqttClient) {
    counterValue++;
    // console.log('Counter value increment: ' + counterValue);
    mqttClient.publish('sensors/' + iotID + '/counter', String(counterValue), {});
    checkIfCounterEqualsMaxValue()
  }
});


module.exports = {};
