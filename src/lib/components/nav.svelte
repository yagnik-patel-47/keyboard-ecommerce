<script lang="ts">
	import { Keyboard, ShoppingCart } from 'lucide-svelte';
	import { Button } from './ui/button';

	import { page } from '$app/stores';
</script>

<nav class="border-b z-50 sticky top-0 bg-background">
	<div class="flex container items-center justify-between py-4">
		<a href="/" class="flex gap-2 items-center font-bold">
			<Keyboard />
			KeyboardShop
		</a>
		<div class="flex items-center gap-3">
			<Button href="/cart" size="icon" variant="outline">
				<ShoppingCart class="size-5" />
			</Button>
			{#if $page.data.userEmail}
				<form method="post" action="?/logout">
					<Button variant="ghost" type="submit" size="sm">Logout</Button>
				</form>
			{:else}
				<Button variant="ghost" href="/login" size="sm">Sign In</Button>
			{/if}
			{#if $page.data.isAdmin}
				<Button variant="ghost" href="/admin" size="sm">Admin</Button>
			{/if}
		</div>
	</div>
</nav>
