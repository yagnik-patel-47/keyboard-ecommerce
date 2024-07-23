<script lang="ts">
	import Nav from '$lib/components/nav.svelte';
	import { ShoppingCart } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { CldImage } from 'svelte-cloudinary';
	import * as Tabs from '$lib/components/ui/tabs';
	import { addToCart } from '$lib/client/cart';
	import ViewTransition from '$lib/components/view-transition.svelte';
	import { toast } from 'svelte-sonner';
	import * as Carousel from '$lib/components/ui/carousel';
	import { type CarouselAPI } from '$lib/components/ui/carousel/context';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import { cn, getHeightFromAspect } from '$lib/utils';
	import { badgeVariants } from '$lib/components/ui/badge/index.js';

	export let data;

	let api: CarouselAPI;
	let current = 0;

	$: if (api) api.rootNode().style.transition = 'height 250ms';

	$: if (api && !!api.slideNodes()[current].offsetHeight) {
		api.rootNode().style.height = `${api.slideNodes()[current].offsetHeight}px`;
	}

	let selectedVariant = 0;
</script>

<ViewTransition />
<Nav />
<div class="container py-12">
	{#if data.product}
		<Breadcrumb.Root>
			<Breadcrumb.List>
				<Breadcrumb.Item>
					<Breadcrumb.Link href="/">Store</Breadcrumb.Link>
				</Breadcrumb.Item>
				<Breadcrumb.Separator />
				<Breadcrumb.Item>
					<Breadcrumb.Link href={`/category/${data.product.category?.slug}`}
						>{data.product.category?.name}</Breadcrumb.Link
					>
				</Breadcrumb.Item>
				<Breadcrumb.Separator />
				<Breadcrumb.Item>
					<Breadcrumb.Page>{data.product.name}</Breadcrumb.Page>
				</Breadcrumb.Item>
			</Breadcrumb.List>
		</Breadcrumb.Root>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-16 my-12">
			<div class="flex flex-col items-center">
				<div class="relative">
					<Carousel.Root opts={{ duration: 15 }} bind:api>
						<Carousel.Content class="ml-0">
							{#each data.product.images as image, index}
								<Carousel.Item
									style={index === 0 ? `view-transition-name: image-${data.product.slug};` : ''}
									class="pl-0 flex justify-center items-center bg-white h-fit"
								>
									<CldImage
										alt={image.cloudinaryId}
										src={image.cloudinaryId}
										width={900}
										height={getHeightFromAspect(image.aspect, 900)}
										objectFit="cover"
									/>
								</Carousel.Item>
							{/each}
						</Carousel.Content>
					</Carousel.Root>
					<div
						class="flex translate-y-1/2 gap-1 md:gap-2 overflow-hidden p-1 md:p-2 bg-white dark:bg-neutral-950 z-10 absolute bottom-0 left-0 right-0 mx-auto max-w-[80%] flex-wrap justify-center w-fit"
					>
						{#each data.product.images as image, index}
							<button
								on:click={() => {
									api.scrollTo(index);
									current = index;
								}}
								class="size-10 md:size-16"
							>
								<CldImage
									alt={image.cloudinaryId}
									src={image.cloudinaryId}
									width={100}
									height={100}
									objectFit="cover"
								/>
							</button>
						{/each}
					</div>
				</div>
			</div>
			<div class={cn(!data.product.description && 'py-10')}>
				<h1 class="text-2xl font-bold">
					{data.product.name}
				</h1>
				<p class="text-xl lg:text-2xl font-semibold mt-6">
					₹{data.product.variants[selectedVariant].price}
				</p>
				{#if data.product.variants[selectedVariant].stock > 0}
					<p class="text-lg mt-6">Available!</p>
				{:else}
					<p class="text-lg mt-6 text-red-500">Not Available at the moment!</p>
				{/if}

				<Button
					on:click={() => {
						if (data.product && data.product.variants[selectedVariant].stripePriceId)
							addToCart({
								productId: data.product.variants[selectedVariant].id,
								productName: data.product.name,
								quantity: 1,
								stripePriceId: data.product.variants[selectedVariant].stripePriceId,
								productImage: data.product.images[0].cloudinaryId,
								amount: Number(data.product.variants[selectedVariant].price),
								code: data.product.variants[selectedVariant].code
							});

						toast.success(`${data.product?.name ?? 'Product'} added to cart.`);
					}}
					size="lg"
					disabled={!(data.product.variants[selectedVariant].stock > 0)}
					class="mt-6 px-10"
				>
					<ShoppingCart class="mr-3 size-5" />
					Add to cart</Button
				>
				<div class="flex items-center gap-3 mt-6">
					<a
						href={`/category/${data.product.category?.slug}`}
						class={cn(badgeVariants({ variant: 'outline' }), 'py-1.5 px-4 hover:bg-muted')}
						>{data.product.category?.name}</a
					>
					{#if data.product.subcategory}
						<a
							href={`/category/${data.product.category?.slug}?sub=${data.product.subcategory?.slug}`}
							class={cn(badgeVariants({ variant: 'outline' }), 'py-1.5 px-4 hover:bg-muted')}
							>{data.product.subcategory?.name}</a
						>
					{/if}
				</div>
				{#if data.product.description}
					<div
						class="prose mt-6 prose-a:text-foreground text-foreground prose-td:py-0 prose-p:my-2"
					>
						{@html data.product.description}
					</div>
				{/if}
			</div>
			{#if data.product.addDetails || data.product.specifications}
				<Tabs.Root
					value={!data.product.specifications ? 'add_details' : 'specs'}
					class="lg:min-w-[400px] mt-8"
				>
					<Tabs.List class="h-auto">
						{#if data.product.specifications}
							<Tabs.Trigger value="specs">Specifications</Tabs.Trigger>
						{/if}
						{#if data.product.addDetails}
							<Tabs.Trigger value="add_details">Additional Details</Tabs.Trigger>
						{/if}
					</Tabs.List>
					{#if data.product.specifications}
						<Tabs.Content value="specs">
							<div
								class="prose prose-a:text-foreground text-foreground prose-td:py-0 prose-headings:text-foreground prose-headings:mt-6"
							>
								{@html data.product.specifications}
							</div>
						</Tabs.Content>
					{/if}
					{#if data.product.addDetails}
						<Tabs.Content value="add_details">
							<div class="prose prose-a:text-foreground text-foreground prose-td:py-0">
								{@html data.product.addDetails}
							</div>
						</Tabs.Content>
					{/if}
				</Tabs.Root>
			{/if}
		</div>
	{:else}
		<p class="text-xl text-center">No products found!</p>
	{/if}
</div>
