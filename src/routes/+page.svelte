<script>
	import Nav from '$lib/components/nav.svelte';
	import ViewTransition from '$lib/components/view-transition.svelte';
	import ProductCard from '$lib/components/product-card.svelte';

	export let data;
</script>

<ViewTransition />

<Nav />
<div class="container my-12">
	<h2 class="text-2xl font-medium">Products</h2>
	<div
		class="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8 mt-8"
	>
		{#each data.products as product}
			<ProductCard {product} />
		{/each}
	</div>
</div>
