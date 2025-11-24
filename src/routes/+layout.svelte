<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="theme-color" content="#1a1a1a" />
	<meta name="description" content="Application PWA de test avec SvelteKit" />
	<link rel="apple-touch-icon" href="/pwa-192x192.png" />
	<meta name="apple-mobile-web-app-title" content="Test PWA" />
</svelte:head>

<div id="app-wrapper">
	{@render children()}
</div>

<style>
	:global(#app-wrapper) {
		min-height: 100vh;
		width: 100%;
	}
</style>
