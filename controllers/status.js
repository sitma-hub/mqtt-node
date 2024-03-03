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
    mqttClient.on("message", (topic, message) => {
      console.log('Received Message: ' + message.toString() + '\nOn topic: ' + topic);
      if (disconnectTimeout) {
        clearTimeout(disconnectTimeout);
      }
      const topicParts = topic.split('/');
      messageJson = JSON.parse(message.toString());
      let status = 'undefined'
      const jsonMessage = {
        status,
        id: iotID,
        name: iotName,
        type: iotType,
        usecase: iotUsecase,
        counterValue,
        clientId: messageJson.clientId,
        timestamp: new Date().toISOString()
      };
      if (topicParts[0] === 'cmd' && topicParts[3] === 'connect') {
        if (!iotClientConnected) {
          iotClientConnected = messageJson.clientId;
          status = 'connected';
          disconnectTimeout = setTimeout(() => {
            iotClientConnected = null;
          }, 1000);
        } else {
          status = 'already connected';
          // TODO: publish warning message
        }
      } else if (topicParts[0] === 'cmd' && topicParts[2] === 'status') {
        mqttClient.publish('sensors/' + iotID + '/status', JSON.stringify(jsonMessage), {});
      }
    });

    
    mqttClient.subscribe('cmd/sensors/status', { qos: 0 });
    mqttClient.subscribe('cmd/sensors/+/connect', { qos: 0 });
    mqttClient.subscribe('cmd/sensors/+/disconnect', { qos: 0 });
}
connectToBroker();


module.exports = {};