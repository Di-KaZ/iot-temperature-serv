import { prisma } from "./prisma";

interface Payload {
  temperature: number;
  water: number;
  conduct: number;
  createdAt?: string;
}

async function getOrCreateDevice(device_id: string, updatedDate?: string) {
  const device = await prisma.device.findFirst({
    where: {
      name: device_id,
    },
  });
  if (!device) {
    return await prisma.device.create({
      data: {
        name: device_id,
      },
    });
  }
  return await prisma.device.update({
    where: {
      id: device.id,
    },
    data: {
      lastConnect: new Date(),
    },
  });
}

export async function persistPayload(device_id: string, payload: Payload) {
  const device = await getOrCreateDevice(device_id);
  return await prisma.data.create({
    data: {
      raw: "",
      temperature: payload.temperature ?? -1,
      water: payload.water ?? -1,
      conductivity: payload.conduct ?? -1,
      deviceId: device.id,
      createdAt: payload.createdAt ?? new Date().toISOString(),
    },
  });
}

export async function persistPayloads(device_id: string, payloads: Payload[]) {
  const device = await getOrCreateDevice(device_id);
  return await payloads.map((payload) =>
    prisma.data.create({
      data: {
        raw: "",
        temperature: payload.temperature ?? -1,
        water: payload.water ?? -1,
        conductivity: payload.conduct ?? -1,
        deviceId: device.id,
        createdAt: payload.createdAt ?? Date.now().toString(),
      },
    })
  );
}
