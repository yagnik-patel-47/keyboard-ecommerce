<script>
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { PackageSearch, ShoppingCart, Sparkle, Blend, Menu } from 'lucide-svelte';
	import * as Sheet from '$lib/components/ui/sheet';
	import { mediaQuery } from 'svelte-legos';

	const isMobile = mediaQuery('(max-width: 768px)');

	let open = false;

	const closeNav = () => (open = false);
</script>

<div class="flex bg-neutral-50 dark:bg-neutral-900">
	{#if $isMobile}
		<Sheet.Root bind:open>
			<Sheet.Content class="p-0" side="left">
				<h1 class="text-2xl px-6 py-8 font-medium">Admin Page</h1>
				<Separator />
				<nav class="group flex flex-col">
					<div class="py-3 grid gap-1 px-2">
						<Button
							on:click={closeNav}
							href="/admin/products"
							variant="ghost"
							class="justify-start text-base"
						>
							<PackageSearch class="mr-2 size-4" aria-hidden="true" />
							Products
						</Button>
						<Button
							on:click={closeNav}
							href="/admin/orders"
							variant="ghost"
							class="justify-start text-base"
						>
							<ShoppingCart class="mr-2 size-4" aria-hidden="true" />
							Orders
						</Button>
					</div>
					<Separator />
					<div class="py-3 grid gap-1 px-2">
						<Button
							on:click={closeNav}
							href="/admin/category"
							variant="ghost"
							class="justify-start text-base"
						>
							<Sparkle class="mr-2 size-4" aria-hidden="true" />
							Categories
						</Button>
						<Button
							on:click={closeNav}
							href="/admin/subcategory"
							variant="ghost"
							class="justify-start text-base"
						>
							<Blend class="mr-2 size-4" aria-hidden="true" />
							Sub Categories
						</Button>
					</div>
				</nav>
			</Sheet.Content>
		</Sheet.Root>
	{:else}
		<div class="w-80 border h-dvh sticky top-0 bg-white dark:bg-neutral-950">
			<h1 class="text-2xl px-6 py-8 font-medium">Admin Page</h1>
			<Separator />
			<nav class="group flex flex-col">
				<div class="py-3 grid gap-1 px-2">
					<Button href="/admin/products" variant="ghost" class="justify-start text-base">
						<PackageSearch class="mr-2 size-4" aria-hidden="true" />
						Products
					</Button>
					<Button href="/admin/orders" variant="ghost" class="justify-start text-base">
						<ShoppingCart class="mr-2 size-4" aria-hidden="true" />
						Orders
					</Button>
				</div>
				<Separator />
				<div class="py-3 grid gap-1 px-2">
					<Button href="/admin/category" variant="ghost" class="justify-start text-base">
						<Sparkle class="mr-2 size-4" aria-hidden="true" />
						Categories
					</Button>
					<Button href="/admin/subcategory" variant="ghost" class="justify-start text-base">
						<Blend class="mr-2 size-4" aria-hidden="true" />
						Sub Categories
					</Button>
				</div>
			</nav>
		</div>
	{/if}
	<div class="container mx-auto py-12">
		{#if $isMobile}
			<div class="flex justify-end mb-2">
				<Button on:click={() => (open = !open)} size="icon" variant="outline">
					<Menu />
				</Button>
			</div>
		{/if}
		<slot />
	</div>
</div>
