<script lang="ts">
	import '../app.css';
	
	let { children } = $props();
</script>

<svelte:head>
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
	<title>My Feed</title>
</svelte:head>

<div class="mx-auto w-full max-w-md">
	{@render children()}
</div>
