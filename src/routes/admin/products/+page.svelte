<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { CldImage } from 'svelte-cloudinary';
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import { Badge } from '$lib/components/ui/badge';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Table from '$lib/components/ui/table';
	import { getHeightFromAspect } from '$lib/utils.js';

	export let data;
</script>

<div class="flex justify-between items-center">
	<h1 class="text-3xl font-medium">Available Products</h1>
	<Button href="/admin/products/new" size="sm">Add Product</Button>
</div>
<div class="mt-12">
	{#if data.products.length}
		<Card.Root>
			<Card.Header>
				<Card.Title>Products</Card.Title>
				<Card.Description>Manage your products and view their sales performance.</Card.Description>
			</Card.Header>
			<Card.Content>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head class="hidden w-[100px] sm:table-cell">
								<span class="sr-only">Image</span>
							</Table.Head>
							<Table.Head>Name</Table.Head>
							<Table.Head>Status</Table.Head>
							<Table.Head>Price</Table.Head>
							<Table.Head class="hidden md:table-cell">Stock</Table.Head>
							<Table.Head class="hidden md:table-cell">Created at</Table.Head>
							<Table.Head>
								<span class="sr-only">Actions</span>
							</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.products as product}
							<Table.Row>
								<Table.Cell class="hidden sm:table-cell">
									{#if product.images.length}
										<CldImage
											class="rounded-lg"
											width={64}
											height={getHeightFromAspect(
												product.images.filter((i) => i.isPrimary)[0].aspect,
												64
											)}
											src={product.images.filter((i) => i.isPrimary)[0].cloudinaryId}
										/>
									{:else}
										<div class="bg-neutral-200 dark:bg-neutral-800 size-16 rounded-lg"></div>
									{/if}
								</Table.Cell>
								<Table.Cell class="font-medium">{product.name}</Table.Cell>
								<Table.Cell>
									<Badge variant="outline">{product.status?.toUpperCase()}</Badge>
								</Table.Cell>
								<Table.Cell
									>{product.variants[0]?.price || '---'}
									{product.variants[0]?.price ? '₹' : ''}</Table.Cell
								>
								<Table.Cell class="hidden md:table-cell"
									>{product.variants[0]?.stock || '---'}</Table.Cell
								>
								<Table.Cell class="hidden md:table-cell"
									>{product.createdAt?.toLocaleDateString()}</Table.Cell
								>
								<Table.Cell>
									<DropdownMenu.Root>
										<DropdownMenu.Trigger asChild let:builder>
											<Button aria-haspopup="true" size="icon" variant="ghost" builders={[builder]}>
												<Ellipsis class="h-4 w-4" />
												<span class="sr-only">Toggle menu</span>
											</Button>
										</DropdownMenu.Trigger>
										<DropdownMenu.Content align="end">
											<DropdownMenu.Label>Actions</DropdownMenu.Label>
											<DropdownMenu.Item>
												<a class="w-full" href={`/admin/products/${product.id}`}>Edit</a>
											</DropdownMenu.Item>
											<DropdownMenu.Item>Delete</DropdownMenu.Item>
										</DropdownMenu.Content>
									</DropdownMenu.Root>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Card.Content>
			<Card.Footer>
				<div class="text-xs text-muted-foreground">
					Showing <strong>1-10</strong> of <strong>32</strong> products
				</div>
			</Card.Footer>
		</Card.Root>
	{:else}
		<p class="text-xl text-center">No products to list!</p>
	{/if}
</div>
