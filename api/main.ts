import express from "express";
import { PrismaClient } from "@prisma/client";
import cron from "node-cron";
import cors from "cors";
import dotenv from "dotenv";
import fetch, { Response } from "node-fetch";

dotenv.config();
const prisma = new PrismaClient();
const app = express();
// add cors
app.use(cors({ origin: "*" }));
app.use(express.json());

async function fetchEvents() {
  const maxDate =
    (
      await prisma.data.findFirst({
        orderBy: {
          createdAt: "desc",
        },
      })
    )?.createdAt ?? new Date(0);

  console.log("📅 maxDate", maxDate);
  const res = await fetch(
    process.env.FETCH_DATA_URL! +
      "?" +
      new URLSearchParams({
        after: maxDate.toISOString(),
      }),
    {
      headers: {
        authorization: process.env.TOKEN!,
      },
    }
  );
  return res;
}

async function parseEvents(res: Response): Promise<any[]> {
  return (await res.text())
    .split(/\r?\n/)
    .map((line) => {
      try {
        return JSON.parse(line.trim());
      } catch {
        return null;
      }
    })
    .filter((d) => d !== null);
}

async function cronTask() {
  console.log("⏳ running cron task");
  const rawEvents = await fetchEvents();
  const events: any[] = await parseEvents(rawEvents);
  console.log("🚀 events", events.length);
  for (const event of events) {
    const payload = event.result.uplink_message?.decoded_payload;
    if (!payload) return;
    const device_id = event.result.end_device_ids.dev_eui;
    const temperature = parseFloat(payload.temp_SOIL);
    const water = parseFloat(payload.water_SOIL);
    const conduct = parseFloat(payload.conduct_SOIL);
    let device = await prisma.device.findFirst({
      where: {
        name: device_id,
      },
    });

    if (!device) {
      console.log("Device not found creating");
      device = await prisma.device.create({
        data: {
          name: device_id,
        },
      });
    }

    await prisma.data.create({
      data: {
        raw: "",
        temperature,
        water,
        conductivity: conduct,
        deviceId: device.id,
        createdAt: event.result.received_at,
      },
    });
  }
  console.log("🆗 sucess saving events !, ending cron");
}

// running cron job 5 minutes
cron.schedule("*/5 * * * *", cronTask);

const server = app.listen(3000);

console.log("🏃‍♂️💨 Server running on http://localhost:3000");

app.get("/devices", async (_, res) => {
  const devices = await prisma.device.findMany();
  res.json(devices);
});

app.post("/devices", async (req, res) => {
  const { name } = req.body;
  const device = await prisma.device.create({
    data: {
      name,
    },
  });
  res.json(device);
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
