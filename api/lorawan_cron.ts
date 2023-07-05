import e from "express";
import { persistPayload, persistPayloads } from "./persist";
import { prisma } from "./prisma";

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

export async function lorawanCronTask() {
  const rawEvents = await fetchEvents();
  const events: any[] = await parseEvents(rawEvents);
  console.log(`⏳ running cron task fetched new ${events.length} events`);
  events.forEach((event) => {
    const payload = event.result.uplink_message?.decoded_payload;
    if (!payload) return;
    const device_id = event.result.end_device_ids.dev_eui;
    console.log("📡 lorawan event handling", device_id);
    const temperature = parseFloat(payload.temp_SOIL);
    const water = parseFloat(payload.water_SOIL);
    const conduct = parseFloat(payload.conduct_SOIL);
    persistPayload(device_id, {
      temperature,
      water,
      conduct,
    });
  });
  console.log("📡 lorawan event handling done");
}
