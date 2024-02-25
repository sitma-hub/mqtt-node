const mqttService = require("../service/mqttService");
const Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO


// Change this to point to your MQTT broker
const MQTT_HOST_NAME = "mqtt://192.168.101.170:1883";

var mqttClient = new mqttService(MQTT_HOST_NAME);
mqttClient.connect();

const curPin = 17;
var pushButton = new Gpio(curPin, 'in', 'rising');


pushButton.watch(function () { //Watch for hardware interrupts on pushButton GPIO, specify callback function
    mqttClient.publish('a', 'button pushed', {});
});


module.exports = {};