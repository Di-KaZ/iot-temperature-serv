#include <soc/rtc.h>
#include "./internal_temp.h"
#include <HTTPClient.h>
#include <WiFi.h>
#include <EEPROM.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>

#define EPROM_SIZE sizeof(int) * 2

const String ssid = "Moussing";
const String password = "cecinestpasunmdp";
const String serverip = "192.168.56.101:3000";

const String url_config = "http://" + serverip + "/esp/config";
const String url_send = "http://" + serverip + "/esp";

const String url_mqtt = "test.mosquitto.org";
const String mqtt_topic = "IOT_YNOV_ESP_TOPIC";
HTTPClient http;
WiFiClient espClient;
PubSubClient client(espClient);

#define CONFIG_FREQ_ADRESS 0
#define CONFIG_MODE_ADRESS sizeof(int)

#define CONFIG_FREQUENCY_KEY "frequency"
#define CONFIG_MODE_KEY "mode"
#define TEMPERATURE_KEY "temperature"
#define DEVICE_ID_KEY "device_id"

#define DEVICE_NAME EEPROM.read(CONFIG_MODE_ADRESS) == MQTT ? "esp32_mqtt" : "esp32_http"
enum config_mode
{
  HTTP = 2,
  MQTT = 1
};

bool requestConfig()
{
  DynamicJsonDocument doc(1024);
  http.begin(url_config.c_str());
  http.addHeader("Content-Type", "application/json");
  if (http.GET() != 200)
  {
    http.end();
    return false;
  }
  String payload = http.getString();
  Serial.printf("Payload: %s\n", payload.c_str());
  deserializeJson(doc, payload);
  int freq = doc[CONFIG_FREQUENCY_KEY];
  config_mode mode = doc[CONFIG_MODE_KEY];
  Serial.printf("config set to -> freq: %d, interval: %d\n", freq, mode);
  EEPROM.put(CONFIG_FREQ_ADRESS, freq);
  EEPROM.put(CONFIG_MODE_ADRESS, mode);
  http.end();
  return true;
}

void connectToWifi()
{
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.println("\nConnecting");
  while (WiFi.status() != WL_CONNECTED)
  {
    Serial.print("|");
    delay(300);
  }
  Serial.println("\nConnected to the WiFi network");
  Serial.print("Local ESP32 IP: ");
  Serial.println(WiFi.localIP());
  client.setServer(url_mqtt.c_str(), 1883);
}

void createPayload(char *buffer, float temperature)
{
  DynamicJsonDocument doc(1024);
  memset(buffer, 0, 1024);
  http.begin(url_send.c_str());
  http.addHeader("Content-Type", "application/json");
  doc[CONFIG_FREQUENCY_KEY] = EEPROM.read(CONFIG_FREQ_ADRESS);
  doc[TEMPERATURE_KEY] = temperature;
  doc[DEVICE_ID_KEY] = DEVICE_NAME;
  serializeJson(doc, buffer, 1024);
}

void sendTemperatureMQTT()
{
  char payload_buffer[1024];
  float temperature = readTemp2(false);
  createPayload(payload_buffer, temperature);
  Serial.printf("Payload MQTT: %s\n", payload_buffer);
  while (!client.connected())
  {
    Serial.println("Connecting to MQTT...");
    if (client.connect(DEVICE_NAME))
    {
      Serial.println("connected");
    }
    else
    {
      Serial.print("failed with state ");
      Serial.print(client.state());
      delay(200);
    }
  }
  boolean res = client.publish(mqtt_topic.c_str(), payload_buffer);
  Serial.printf("MQTT POST result: %d\n", res);
}

void sendTemperatureHttp()
{
  char payload_buffer[1024];
  float temperature = readTemp2(false);
  createPayload(payload_buffer, temperature);
  Serial.printf("Payload HTTP: %s\n", payload_buffer);
  int res = http.POST(payload_buffer);
  Serial.printf("HTTP POST result: %d\n", res);
  http.end();
}

void disconnectFromWifi()
{
  WiFi.disconnect();
  Serial.println("Disconnected from the WiFi network");
}

void setup()
{
  EEPROM.begin(EPROM_SIZE);
  Serial.begin(115200);
  delay(10000);

  // configure RTC slow clock to internal oscillator, fast clock to XTAL divided by 4
  rtc_clk_slow_freq_set(RTC_SLOW_FREQ_RTC);
  rtc_clk_fast_freq_set(RTC_FAST_FREQ_XTALD4);

  // read CPU speed
  rtc_cpu_freq_config_t freq_config;
  rtc_clk_cpu_freq_get_config(&freq_config);
}

void loop()
{

  connectToWifi();
  requestConfig();
  int freq = EEPROM.read(CONFIG_FREQ_ADRESS);
  config_mode mode = (config_mode)EEPROM.read(CONFIG_MODE_ADRESS);
  Serial.printf("freq: %d, mode: %d\n", freq, mode);
  if (mode == HTTP)
  {
    Serial.println("HTTP mode");
    sendTemperatureHttp();
  }
  else if (mode == MQTT)
  {
    Serial.println("MQTT mode");
    sendTemperatureMQTT();
  }
  disconnectFromWifi();
  delay(freq * 1000);
}