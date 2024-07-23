<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	export let data;
</script>

<section class="container py-20">
	{#if data.success}
		<div class="flex items-center flex-col gap-4">
			<h1 class="text-3xl font-semibold">You are admin now.</h1>
			<Button href="/admin" variant="ghost">Check Admin Page</Button>
		</div>
	{:else}
		<h1>An error occured. you can refresh this page.</h1>
	{/if}
</section>
