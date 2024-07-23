<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import * as Sheet from '$lib/components/ui/sheet';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { CreditCard, Copy, EllipsisVertical } from 'lucide-svelte';
	import { Separator } from '$lib/components/ui/separator';
	import { enhance } from '$app/forms';

	export let data;

	let selectedOrder: (typeof data.orders)[number] | null = null;
</script>

<h1 class="text-3xl font-semibold">Recent Orders</h1>
<Card.Root class="mt-10">
	<Card.Header class="px-7">
		<Card.Title>Orders</Card.Title>
		<Card.Description>Recent orders from your store.</Card.Description>
	</Card.Header>
	<Card.Content>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Customer</Table.Head>
					<Table.Head class="hidden sm:table-cell">Type</Table.Head>
					<Table.Head class="hidden sm:table-cell">Status</Table.Head>
					<Table.Head class="hidden md:table-cell">Date</Table.Head>
					<Table.Head class="text-right">Amount</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.orders as order}
					<Table.Row>
						<Table.Cell>
							<div class="font-medium">{order.customerName}</div>
							<div class="hidden text-sm text-muted-foreground md:inline">
								{order.customerEmail}
							</div>
						</Table.Cell>
						<Table.Cell class="hidden sm:table-cell">Sale</Table.Cell>
						<Table.Cell class="hidden sm:table-cell">
							<Badge class="text-xs" variant="secondary">Fulfilled</Badge>
						</Table.Cell>
						<Table.Cell class="hidden md:table-cell"
							>{order.order.timestamp.toLocaleString('en-in', {
								timeStyle: 'short',
								dateStyle: 'long'
							})}</Table.Cell
						>
						<Table.Cell class="text-right">{order.product.price}₹</Table.Cell>
						<Table.Cell>
							<DropdownMenu.Root>
								<DropdownMenu.Trigger asChild let:builder>
									<Button aria-haspopup="true" size="icon" variant="ghost" builders={[builder]}>
										<EllipsisVertical class="size-4" />
										<span class="sr-only">Toggle menu</span>
									</Button>
								</DropdownMenu.Trigger>
								<DropdownMenu.Content>
									<form
										use:enhance
										method="post"
										action={`?/delete&id=${selectedOrder?.order.stripeOrderId}`}
									>
										<DropdownMenu.Group>
											<DropdownMenu.Label>Actions</DropdownMenu.Label>
											<DropdownMenu.Separator />
											<DropdownMenu.Item on:click={() => (selectedOrder = order)}
												>View Details
											</DropdownMenu.Item>
											<DropdownMenu.Item class="p-0">
												<Button
													class="py-1.5 h-fit w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-900/20"
													variant="ghost"
													size="sm"
													type="submit">Delete</Button
												>
											</DropdownMenu.Item>
										</DropdownMenu.Group>
									</form>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</Card.Content>
</Card.Root>

<Sheet.Root open={selectedOrder !== null}>
	<Sheet.Content class="min-w-fit">
		<Card.Root class="overflow-hidden mt-6">
			<Card.Header class="flex flex-row items-start bg-muted/50">
				<div class="grid gap-0.5">
					<Card.Title class="group flex items-center gap-2 text-lg">
						<span class="text-wrap">Order: {selectedOrder?.id}</span>
						<Button
							size="icon"
							variant="outline"
							class="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
						>
							<Copy class="h-3 w-3" />
							<span class="sr-only">Copy Order ID</span>
						</Button>
					</Card.Title>
					<Card.Description
						>Date: {selectedOrder?.order.timestamp.toLocaleDateString('en-in', {
							dateStyle: 'long'
						})}</Card.Description
					>
				</div>
			</Card.Header>
			<Card.Content class="p-6 text-sm">
				<div class="grid gap-3">
					<div class="font-semibold">Order Details</div>
					<ul class="grid gap-3">
						<li class="flex items-center justify-between">
							<span class="text-muted-foreground max-w-60">
								{selectedOrder?.product.rootProduct.name} ({selectedOrder?.product.name}) x
								<span>{selectedOrder?.quantity}</span>
							</span>
							<span>{Number(selectedOrder?.product.price) * (selectedOrder?.quantity ?? 1)}₹</span>
						</li>
					</ul>
					<Separator class="my-2" />
					<ul class="grid gap-3">
						<li class="flex items-center justify-between">
							<span class="text-muted-foreground">Subtotal</span>
							<span>{Number(selectedOrder?.product.price) * (selectedOrder?.quantity ?? 1)}₹</span>
						</li>
						<li class="flex items-center justify-between">
							<span class="text-muted-foreground">Shipping</span>
							<span>0₹</span>
						</li>
						<li class="flex items-center justify-between">
							<span class="text-muted-foreground">Tax</span>
							<span>0₹</span>
						</li>
						<li class="flex items-center justify-between font-semibold">
							<span class="text-muted-foreground">Total</span>
							<span>{Number(selectedOrder?.product.price) * (selectedOrder?.quantity ?? 1)}₹</span>
						</li>
					</ul>
				</div>
				<Separator class="my-4" />
				<div class="grid grid-cols-2 gap-4">
					<div class="grid gap-3">
						<div class="font-semibold">Shipping Information</div>
						<address class="grid gap-0.5 not-italic text-muted-foreground">
							<span>{selectedOrder?.customerName}</span>
							{#if selectedOrder?.shippingAddress?.line1}
								<span>{selectedOrder.shippingAddress.line1}</span>
							{/if}
							{#if selectedOrder?.shippingAddress?.line2}
								<span>{selectedOrder.shippingAddress.line2}</span>
							{/if}
							{#if selectedOrder?.shippingAddress?.city}
								<span>{selectedOrder.shippingAddress.city}</span>
							{/if}
							<span
								>{selectedOrder?.shippingAddress?.state}, {selectedOrder?.shippingAddress?.country}
								{selectedOrder?.shippingAddress?.postal_code}</span
							>
						</address>
					</div>
					<div class="grid auto-rows-max gap-3">
						<div class="font-semibold">Billing Information</div>
						<div class="text-muted-foreground">Same as shipping address</div>
					</div>
				</div>
				<Separator class="my-4" />
				<div class="grid gap-3">
					<div class="font-semibold">Customer Information</div>
					<dl class="grid gap-3">
						<div class="flex items-center justify-between">
							<dt class="text-muted-foreground">Customer</dt>
							<dd>{selectedOrder?.customerName}</dd>
						</div>
						<div class="flex items-center justify-between">
							<dt class="text-muted-foreground">Email</dt>
							<dd>
								<a href="mailto:">{selectedOrder?.customerEmail}</a>
							</dd>
						</div>
						<div class="flex items-center justify-between">
							<dt class="text-muted-foreground">Phone</dt>
							<dd>
								<a href="tel:">-</a>
							</dd>
						</div>
					</dl>
				</div>
				<Separator class="my-4" />
				<div class="grid gap-3">
					<div class="font-semibold">Payment Information</div>
					<dl class="grid gap-3">
						<div class="flex items-center justify-between">
							<dt class="flex items-center gap-1 text-muted-foreground">
								<CreditCard class="h-4 w-4" />
								Visa
							</dt>
							<dd>**** **** **** 4532</dd>
						</div>
					</dl>
				</div>
			</Card.Content>
			<Card.Footer class="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
				<div class="text-xs text-muted-foreground">
					Updated <time dateTime="2023-11-23"
						>{selectedOrder?.order.timestamp.toLocaleString('en-in', {
							timeStyle: 'short',
							dateStyle: 'long'
						})}</time
					>
				</div>
			</Card.Footer>
		</Card.Root>
	</Sheet.Content>
</Sheet.Root>
