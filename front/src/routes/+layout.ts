import { z } from 'zod';
import { DataSchema, DeviceSchema } from '$lib/zod/types.js';

export async function load({ url }) {
	const devices = z
		.array(DeviceSchema)
		.parse(await (await fetch('http://localhost:3000/devices/')).json());

	const name: string = url.searchParams.get('name');
	const date: string = url.searchParams.get('day');
	let deailsUrl = `http://localhost:3000/devices/`;
	if (name) deailsUrl += `${name}/`;
	if (date) deailsUrl += `${date}/`;

	const details = name ? z.array(DataSchema).parse(await (await fetch(deailsUrl)).json()) : null;

	return {
		name,
		date,
		devices,
		details
	};
}
