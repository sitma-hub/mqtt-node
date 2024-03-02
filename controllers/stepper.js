const Gpio = require('onoff').Gpio; 
const mqtt = require("mqtt");

connectToBroker = () => {
    const clientId = "client" + Math.random().toString(36).substring(7);
  
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
        motorOn = !motorOn;
        if (motorOn){
            step();
        }
    });
    
    mqttClient.subscribe('a', { qos: 0 });
}
connectToBroker();

const stepPins = [24, 25, 8, 7]; // connect to motor controller input pins 1 to 4 in the same order
const pinNumber = stepPins.length;
const pins = [];
let stepCounter = 0;
const timeout = 0.01;
const stepCount = 8;
let motorOn = false;

const Seq = [];
Seq[0] = [1,0,0,0];
Seq[1] = [1,1,0,0];
Seq[2] = [0,1,0,0];
Seq[3] = [0,1,1,0];
Seq[4] = [0,0,1,0];
Seq[5] = [0,0,1,1];
Seq[6] = [0,0,0,1];
Seq[7] = [1,0,0,1];

for(let i = 0; i<  pinNumber; i++){
    pins[i] = new Gpio(stepPins[i], 'out');
}

const step = () => {
    for (let pin = 0; pin < 4; pin++) {
        if (Seq[stepCounter][pin] != 0) {
            pins[pin].writeSync(1);
        } else {
            pins[pin].writeSync(0);
        }
    }
    
    stepCounter += 1
    if (stepCounter === stepCount){
        stepCounter = 0;
    }
    if (stepCounter < 0){
        stepCounter = stepCount;
    }
    if (motorOn){
        setTimeout( ()=>step(), timeout );
    } 
}


module.exports = {};