<script lang="ts">
	import { Line } from 'svelte-chartjs';
	import 'chart.js/auto';
	import { Chart } from 'chart.js';
	import type { LayoutData } from '$lib/zod/types';
	import { DateTime } from 'luxon';
	Chart.defaults.borderColor = 'rgb(148 163 184)';
	Chart.defaults.color = '#fff';

	export let data: LayoutData;

	$: water_points =
		data?.details?.map((data) => {
			return data.water;
		}) ?? [];

	$: temperature_points =
		data?.details?.map((data) => {
			return data.temperature;
		}) ?? [];

	$: conductivity_points =
		data?.details?.map((data) => {
			return data.conductivity;
		}) ?? [];

	$: labels = data?.details?.map((data) => {
		return (
			DateTime.fromISO(data.createdAt).toLocaleString(DateTime.TIME_SIMPLE, { locale: 'fr-FR' }) ??
			[]
		);
	});
</script>

{#if !data.details || data.details.length === 0}
	<div class="w-full h-full items-center justify-center flex">
		{#if data.name}
			<h1>
				Aucune données pour l'appareil "{data.name}"
				{data.date
					? `le ${DateTime.fromISO(data.date).toLocaleString(DateTime.DATETIME_SHORT, {
							locale: 'fr-FR'
					  })}`
					: ''}
			</h1>
		{:else}
			<h1>No devices</h1>
		{/if}
	</div>
{:else}
	<div class="mx-12">
		{#if water_points}
			<Line
				data={{
					labels: labels,

					datasets: [
						{
							label: 'Water level',
							backgroundColor: 'lightblue',
							borderColor: 'lightblue',
							data: water_points
						}
					]
				}}
			/>
		{/if}
		{#if temperature_points}
			<Line
				data={{
					labels: labels,
					datasets: [
						{
							label: 'Temperature (C°)',
							backgroundColor: 'orange',
							borderColor: 'orange',
							data: temperature_points
						}
					]
				}}
			/>
		{/if}
		{#if conductivity_points}
			<Line
				data={{
					labels: labels,

					datasets: [
						{
							label: 'Conductivity (µS/cm)',
							backgroundColor: 'green',
							borderColor: 'green',
							data: conductivity_points
						}
					]
				}}
			/>
		{/if}
	</div>
{/if}
