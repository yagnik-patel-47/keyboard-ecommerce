<script lang="ts">
	// import { type Product, type ProductVariant } from '$lib/server/db/schema';
	import { getHeightFromAspect } from '$lib/utils';
	import { CldImage } from 'svelte-cloudinary';

	// type $$Props = {
	// 	product: Product;
	// };

	export let product;
</script>

<a href={`/product/${product.slug}`} class="group">
	<div
		style={`view-transition-name: image-${product.slug};`}
		class="w-full aspect-square flex justify-center items-center bg-white rounded-lg"
	>
		{#if product.images[0]?.cloudinaryId}
			<CldImage
				alt={product.images[0].cloudinaryId}
				src={product.images[0].cloudinaryId}
				width={600}
				height={getHeightFromAspect(product.images[0].aspect, 600)}
				objectFit="cover"
				class="rounded-lg"
			/>
		{:else}
			<div class="size-[300px] bg-neutral-700 rounded-lg"></div>
		{/if}
	</div>
	<h3
		style={`view-transition-name: name-${product.slug};`}
		class="mt-4 text-gray-700 dark:text-neutral-200"
	>
		{product.name}
	</h3>
	<p
		style={`view-transition-name: price-${product.slug};`}
		class="mt-1 text-lg font-medium text-gray-900 dark:text-neutral-100"
	>
		₹{product.variants[0].price}
	</p>
</a>
