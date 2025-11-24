<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="theme-color" content="#1a1a1a" />
	<meta name="description" content="Application PWA de test avec SvelteKit" />
	<link rel="apple-touch-icon" href="/pwa-192x192.png" />
</svelte:head>

{@render children()}
