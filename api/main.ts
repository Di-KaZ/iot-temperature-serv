import express from "express";
import { PrismaClient } from "@prisma/client";
import cron from "node-cron";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./prisma";
import { lorawanCronTask } from "./lorawan_cron";
import { MqttHandler } from "./mqtt";
import { persistPayload } from "./persist";

dotenv.config();
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.listen(3000);

const mqttHandler = new MqttHandler(
  process.env.MQTT_URL!,
  process.env.MQTT_TOPIC!,
  parseInt(process.env.MQTT_PORT!)
);
mqttHandler.connect();

cron.schedule("*/5 * * * *", lorawanCronTask);

console.log("🏃‍♂️💨 Api running on http://localhost:3000");

app.post("/esp/", async (req, res) => {
  const { device_id, temperature } = req.body;

  const data = await persistPayload(device_id, {
    temperature,
    water: -1,
    conduct: -1,
  });

  res.json(data);
});

enum EspMode {
  MQTT = 1,
  HTTP = 2,
}

app.get("/esp/config", async (_, res) => {
  console.log("📡 esp config");
  return res.json({
    mode: EspMode.MQTT,
    frequency: 5,
  });
});

app.get("/devices", async (_, res) => {
  const devices = await prisma.device.findMany();
  res.json(devices);
});

app.get("/devices/:name", async (req, res) => {
  const name = req.params.name;
  const device = await prisma.data.findMany({
    where: {
      device: {
        name,
      },
    },
  });
  res.json(device);
});

app.get("/devices/:name/:date", async (req, res) => {
  const { name, date } = req.params;
  const start = new Date(new Date(date).toDateString());
  const end = new Date(start.toISOString());
  end.setHours(23, 59, 59);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    res.status(400).json({
      error: "Invalid date",
    });
    return;
  }

  const device = await prisma.data.findMany({
    where: {
      device: {
        name,
      },
      createdAt: {
        gte: start,
        lte: end,
      },
    },
  });
  res.json(device);
});
