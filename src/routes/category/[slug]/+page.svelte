<script lang="ts">
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import ViewTransition from '$lib/components/view-transition.svelte';
	import ProductCard from '$lib/components/product-card.svelte';
	import * as Select from '$lib/components/ui/select';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { goto } from '$app/navigation';
	import { Slider } from '$lib/components/ui/slider';
	import { Input } from '$lib/components/ui/input';

	export let data;

	function debounce<T extends (...args: any[]) => void>(
		fn: T,
		delay: number = 300
	): (...args: Parameters<T>) => void {
		let timeoutID: NodeJS.Timeout | undefined;
		return (...args: Parameters<T>) => {
			clearTimeout(timeoutID);
			timeoutID = setTimeout(() => fn(...args), delay);
		};
	}

	function handleFilter(
		filter: Record<string, string> | URLSearchParams,
		type: 'add' | 'remove' = 'add'
	) {
		if (type === 'add') {
			for (const [key, value] of Object.entries(filter)) {
				$page.url.searchParams.set(key, value);
			}
			goto(`?${$page.url.searchParams.toString()}`, {
				invalidateAll: true
			});
		} else {
			for (const [key, value] of Object.entries(filter)) {
				$page.url.searchParams.delete(key);
			}
			goto(`?${$page.url.searchParams.toString()}`, {
				invalidateAll: true
			});
		}
	}

	function clearFilters() {
		let params: Record<string, string> = {};
		for (const [key, value] of $page.url.searchParams.entries()) {
			params[key] = value;
		}
		handleFilter(params, 'remove');
	}

	$: selectedSubC = {
		label: data.category?.subcategories.filter(
			(subc) => subc.slug === $page.url.searchParams.get('sub')
		)[0]?.name,
		value: data.category?.subcategories.filter(
			(subc) => subc.slug === $page.url.searchParams.get('sub')
		)[0]?.slug
	};

	let absMinPrice: number;
	let absMaxPrice: number;

	$: if (data.category)
		absMinPrice = Math.min(
			...data.category.products.flatMap((p) => p.variants).map((v) => v.price)
		);
	$: if (data.category)
		absMaxPrice = Math.max(
			...data.category?.products.flatMap((p) => p.variants).map((v) => v.price)
		);

	$: minPrice = $page.url.searchParams.get('range')
		? Number($page.url.searchParams.get('range')?.split('-')[0])
		: absMinPrice;
	$: maxPrice = $page.url.searchParams.get('range')
		? Number($page.url.searchParams.get('range')?.split('-')[1])
		: absMaxPrice;

	$: priceRange = [minPrice, maxPrice];

	const handlePriceRange = debounce((v: number[]) => {
		if (v[0] === absMinPrice && v[1] === absMaxPrice) {
			handleFilter({ range: v.join('-') }, 'remove');
		} else {
			handleFilter({ range: v.join('-') });
		}
	});
</script>

<ViewTransition />
{#if data.category}
	<div class="container py-20">
		<Breadcrumb.Root>
			<Breadcrumb.List>
				<Breadcrumb.Item>
					<Breadcrumb.Link href="/">Home</Breadcrumb.Link>
				</Breadcrumb.Item>
				<Breadcrumb.Separator />
				<Breadcrumb.Item>
					<Breadcrumb.Link href="/all">All Products</Breadcrumb.Link>
				</Breadcrumb.Item>
				<Breadcrumb.Separator />
				<Breadcrumb.Item>
					<Breadcrumb.Page>{data.category.name}</Breadcrumb.Page>
				</Breadcrumb.Item>
			</Breadcrumb.List>
		</Breadcrumb.Root>
		<main class="flex gap-20 mt-10">
			{#if data.products.length}
				<div class="grid lg:grid-cols-2 xl:grid-cols-3 gap-4 basis-3/4">
					{#each data.products as product}
						<ProductCard {product} />
					{/each}
				</div>
			{:else}
				<div class="basis-3/4 py-20">
					<h3 class="text-center text-xl lg:text-2xl font-semibold">No product found!</h3>
				</div>
			{/if}

			<div class="space-y-6 py-4 basis-1/4">
				<div class="flex justify-between w-full">
					<h3 class="text-2xl font-semibold">Filters</h3>
					<Button
						disabled={$page.url.searchParams.toString() === ''}
						on:click={clearFilters}
						size="sm">Clear Filters</Button
					>
				</div>

				<div class="space-y-2">
					<Label for="subcategory">Subcategory</Label>
					<Select.Root
						name="subcategory"
						selected={selectedSubC}
						onSelectedChange={(v) => v && v?.value && handleFilter({ sub: v.value })}
					>
						<Select.Trigger>
							<Select.Value placeholder="Select Subcategory" />
						</Select.Trigger>
						<Select.Content>
							{#each data.category.subcategories as subcategory}
								<Select.Item value={subcategory.slug}>{subcategory.name}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div class="space-y-4">
					<Label for="pricerange">Price Range</Label>
					<Slider
						onValueChange={handlePriceRange}
						min={absMinPrice}
						max={absMaxPrice}
						bind:value={priceRange}
					/>
					<div class="flex gap-3 items-center">
						<Input min={absMinPrice} bind:value={priceRange[0]} type="number" />
						<span>-</span>
						<Input max={absMaxPrice} bind:value={priceRange[1]} type="number" />
					</div>
				</div>
			</div>
		</main>
	</div>
{:else}
	<h2 class="mt-20 text-center text-xl lg:text-2xl font-semibold">Page not found!</h2>
{/if}
