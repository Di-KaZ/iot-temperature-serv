<script lang="ts">
	// Your selected Skeleton theme:
	import '@skeletonlabs/skeleton/themes/theme-skeleton.css';
	// This contains the bulk of Skeletons required styles:
	import '@skeletonlabs/skeleton/styles/skeleton.css';
	import { Accordion, AccordionItem, AppShell } from '@skeletonlabs/skeleton';
	import { AppBar } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import type { LayoutData } from '$lib/zod/types';
	import { DateTime } from 'luxon';

	export let data: LayoutData;
	let day = new Date(data.date ?? '');
	let name: string;

	function handleDeviceClick(device: string) {
		name = device;
		let url = `/?name=${name}`;

		if (isNaN(day.getTime())) {
			goto(url, { replaceState: true });
			return;
		}
		goto(`/?name=${name}&day=${day.toISOString()}`, { replaceState: true });
	}

	function handleDateChange(date: string) {
		if (!name) return;
		day = new Date(date ?? '');
		goto(`/?name=${name}&day=${day.toISOString()}`, { replaceState: true });
	}

	function handleCancel() {
		if (!name) {
			goto(`/`, { replaceState: true });
		} else {
			goto(`/?name=${name}`, { replaceState: true });
		}
	}
</script>

<AppShell class="h-screen">
	<svelte:fragment slot="header">
		<AppBar>
			<h1 class="text-2xl">Humidr/</h1>
		</AppBar>
	</svelte:fragment>
	<svelte:fragment slot="sidebarLeft">
		<div class="bg-surface-100-800-token h-full p-4">
			<div class="input-group input-group-divider grid-cols-[auto_1fr_auto] text-2xl">
				<div class="input-group-shim">Date</div>
				<input
					placeholder="Search..."
					type="date"
					on:change={(e) => handleDateChange(e.currentTarget.value)}
					value={isNaN(day.getTime()) ? undefined : day.toISOString().split('T')[0]}
					lang="fr-FR"
					disabled={!name}
				/>
				<button class="btn variant-filled" on:click={handleCancel}>Annuler</button>
			</div>
			<h1 class="py-4">Appareils</h1>
			<Accordion>
				{#if !data.devices || data.devices.length === 0}
					<h4 class="text-red-400">Aucun appareil</h4>
				{:else}
					{#each data.devices as device}
						<AccordionItem on:click={() => handleDeviceClick(device.name)}>
							<svelte:fragment slot="lead">📱</svelte:fragment>
							<svelte:fragment slot="summary">{device.name}</svelte:fragment>
							<svelte:fragment slot="content">
								last connection : {DateTime.fromISO(device.lastConnect).toLocaleString(
									DateTime.DATETIME_SHORT,
									{ locale: 'fr-FR' }
								)}
							</svelte:fragment>
						</AccordionItem>
					{/each}
				{/if}
			</Accordion>
		</div>
	</svelte:fragment>
	<div class="h-full w-full">
		<slot />
	</div>
	<svelte:fragment slot="footer">
		<AppBar>Fofana Moussa™️©️🆗💡</AppBar>
	</svelte:fragment>
</AppShell>
