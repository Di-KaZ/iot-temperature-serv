import { z } from 'zod';

const BaseDeviceSchema = z.object({
	id: z.number(),
	name: z.string(),
	lastConnect: z.string()
});

export const DataSchema = z.object({
	id: z.number(),
	deviceId: z.number(),
	createdAt: z.string(),
	raw: z.string(),
	water: z.number(),
	conductivity: z.number(),
	temperature: z.number(),
	device: BaseDeviceSchema.optional()
});

export const DeviceSchema = BaseDeviceSchema.extend({
	data: z.array(DataSchema).optional()
});

export const LayoutDataSchema = z.object({
	name: z.string().optional(),
	date: z.string().optional(),
	devices: z.array(DeviceSchema).optional(),
	details: z.array(DataSchema).optional()
});

export type LayoutData = z.infer<typeof LayoutDataSchema>;
export type Device = z.infer<typeof DeviceSchema>;
export type Data = z.infer<typeof DataSchema>;
