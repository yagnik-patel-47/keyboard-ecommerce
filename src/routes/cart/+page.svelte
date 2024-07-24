<script lang="ts">
	import Nav from '$lib/components/nav.svelte';
	import { getCart, removeFromCart, addToCart, decrementQuantity } from '$lib/client/cart';
	import { applyAction, deserialize } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import { CldImage } from 'svelte-cloudinary';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { goto } from '$app/navigation';
	import { Plus, Minus, Delete, Trash, Trash2 } from 'lucide-svelte';
	import ViewTransition from '$lib/components/view-transition.svelte';
	import { Separator } from '$lib/components/ui/separator';

	export let data;

	let cart = getCart();

	$: total =
		cart.length > 0
			? cart.reduce((prev, curr) => {
					return {
						...prev,
						amount: prev.amount + curr.amount * curr.quantity
					};
				}).amount
			: 0;

	async function handleSubmit(event: { currentTarget: EventTarget & HTMLFormElement }) {
		const response = await fetch(event.currentTarget.action, {
			method: 'POST',
			body: JSON.stringify(cart)
		});

		const result: ActionResult<{ url: string }> = deserialize(await response.text());

		applyAction(result);
	}
</script>

<ViewTransition />
<Nav />
<div class="w-full flex py-4 md:gap-x-16 flex-col gap-5 grow container">
	<div class="md:text-4xl text-3xl font-semibold">Review Shopping Cart</div>

	{#if total < 500}
		<div class="dark:text-neutral-200 md:text-xl">
			All orders over ₹500.00 will receive free shipping!
		</div>
	{:else}
		<div class="flex flex-row items-center gap-1 md:text-2xl sm:text-xl">
			<svg
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
					fill="green"
				/>
			</svg>
			<div class="text-neutral-700 dark:text-neutral-200">
				Your order qualifies for <span class="text-green-600 font-medium">FREE shipping!</span>
			</div>
		</div>
	{/if}

	<div class="flex flex-row items-center justify-end w-full sticky top-0">
		<div class="text-base lg:text-xl dark:text-neutral-200 px-3">
			Subtotal <span class="text-xl font-semibold">
				₹{cart.length > 0
					? cart.reduce((sum, el) => sum + el.amount * el.quantity, 0).toFixed(2)
					: '0.00'}
			</span>
		</div>
		<form method="post" on:submit|preventDefault={handleSubmit}>
			{#if data.userEmail}
				<Button class="max-sm:px-2 max-sm:h-9" type="submit" disabled={cart.length === 0}>
					{cart.length > 0
						? `Check Out (${cart.length} item${cart.length == 1 ? '' : 's'})`
						: 'Please pick an item first'}
				</Button>
			{:else}
				<Dialog.Root>
					<Dialog.Trigger>
						<Button class="max-sm:px-2 max-sm:h-9" type="button" disabled={cart.length === 0}>
							{cart.length > 0
								? `Check Out (${cart.length} item${cart.length == 1 ? '' : 's'})`
								: 'Please pick an item first'}
						</Button>
					</Dialog.Trigger>
					<Dialog.Content class="sm:max-w-[425px]">
						<Dialog.Header>
							<Dialog.Title>Account</Dialog.Title>
							<Dialog.Description>
								Would you like to create an account to save your information, manage your orders,
								and get special offers?
							</Dialog.Description>
						</Dialog.Header>
						<form
							class="flex flex-row justify-center gap-x-5 w-full"
							method="post"
							on:submit|preventDefault={handleSubmit}
						>
							<Button type="submit" class="w-full">Continue as guest</Button>
						</form>
						<Button type="button" on:click={() => goto('/login')} class="w-full" variant="outline"
							>Create account</Button
						>
					</Dialog.Content>
				</Dialog.Root>
			{/if}
		</form>
	</div>

	<Separator />

	<div class=" md:rounded-lg">
		<div class="flex flex-col md:flex-row flex-wrap">
			{#each cart as cartItem, i}
				<div class="w-full md:mx-auto py-2 flex gap-2 md:gap-10">
					<div class="w-1/3 md:w-[200px] rounded-lg overflow-hidden h-full">
						<CldImage src={cartItem.productImage} width={400} height={400} objectFit="cover" />
					</div>
					<div class="flex flex-col gap-1 sm:gap-3 w-1/2">
						<div class="flex flex-col sm:flex-row sm:items-center justify-between py-2">
							<div class="text-sm md:text-xl font-semibold lg:text-4xl">{cartItem.productName}</div>
						</div>
						<div class="flex flex-row items-center gap-3">
							<Button
								variant="outline"
								size="icon"
								disabled={cartItem.quantity == 1}
								on:click={() => {
									decrementQuantity(i);
									cart = getCart();
								}}
							>
								<Minus class="size-4" />
							</Button>
							{cartItem.quantity}
							<Button
								variant="outline"
								size="icon"
								on:click={() => {
									addToCart(cartItem);
									cart = getCart();
								}}
							>
								<Plus class="size-4" />
							</Button>
							<Button
								variant="outline"
								size="icon"
								class="hover:text-red-600 hover:bg-red-900/10 transition"
								on:click={() => {
									removeFromCart(i);
									cart = getCart();
								}}
							>
								<Trash2 class="size-4 md:size-5" />
							</Button>
						</div>
					</div>
				</div>
				<div class="bg-neutral-300 h-[1px] w-full"></div>
			{/each}
		</div>
	</div>
</div>
