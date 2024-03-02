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
  
    mqttClient.on("error", () => {
      mqttClient.end();
    });
    mqttClient.on("message", () => {
        const jsonMessage = {
            status: 'connected',
            id: iotID,
            name: iotName,
            type: iotType,
            usecase: iotUsecase,
            counterValue,
            timestamp: new Date().toISOString()
        };
        mqttClient.publish('sensors/' + iotID + '/status', JSON.stringify(jsonMessage), {});
    });
    
    mqttClient.subscribe('cmd/sensors/status', { qos: 0 });
}
connectToBroker();


module.exports = {};