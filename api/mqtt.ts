import mqtt from "mqtt";
import { persistPayload } from "./persist";

export class MqttHandler {
  mqttClient: mqtt.MqttClient | null;
  host: string;
  username?: string;
  password?: string;
  topicName: string;
  port?: number;

  constructor(
    host: string,
    topic?: string,
    port?: number,
    username?: string,
    password?: string
  ) {
    this.mqttClient = null;
    this.host = host;
    this.username = username;
    this.password = password;
    this.topicName = topic || "YOUR_TOPIC";
    this.port = port;
  }

  connect() {
    // Connect mqtt with credentials (in case of needed, otherwise we can omit 2nd param)
    if (!this.username) {
      (this.mqttClient = mqtt.connect(this.host)),
        {
          port: this.port,
        };
    } else {
      this.mqttClient = mqtt.connect(this.host, {
        username: this.username,
        password: this.password,
        port: this.port,
      });
    }
    // Mqtt error calback
    this.mqttClient.on("error", (err) => {
      console.log("An error has occured: ", err);
      this.mqttClient?.end();
    });

    // Connection on success
    this.mqttClient.on("connect", () => {
      console.log(
        `📶 Mqtt client connected ${this.host} topic ${this.topicName}`
      );
    });

    // Mqtt subscriptions
    this.mqttClient.subscribe(this.topicName, { qos: 0 });

    // Logging a message when it arives
    this.mqttClient.on("message", function (topic, message) {
      console.log(`📬 mqtt recive : "${message.toString()}"`);
      const { device_id, ...payload } = JSON.parse(message.toString());
      persistPayload(device_id, payload);
    });

    this.mqttClient.on("close", () => {
      console.log(`🔐 mqtt client disconnected`);
    });
  }

  // Sends a mqtt message to topic: mytopic
  sendMessage(message: string) {
    this.mqttClient?.publish(this.topicName, message);
  }
}
