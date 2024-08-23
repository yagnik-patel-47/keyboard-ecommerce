<script lang="ts">
	import { Keyboard, ShoppingCart, Moon, Sun, EllipsisVertical } from 'lucide-svelte';
	import { Button } from './ui/button';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { mediaQuery } from 'svelte-legos';
	import * as Popover from '$lib/components/ui/popover';

	let isDark = true;

	const smaller = mediaQuery('(max-width: 768px)');

	onMount(() => {
		isDark = document.body.classList.contains('dark');
	});

	function toggleThemeMode() {
		document.body.classList.toggle('dark');
		isDark = !isDark;
	}
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
			{#if $smaller}
				<Popover.Root>
					<Popover.Trigger>
						<Button variant="ghost" size="icon">
							<EllipsisVertical class="size-5" />
						</Button>
					</Popover.Trigger>
					<Popover.Content class="max-w-40">
						{#if $page.data.userEmail}
							<form method="post" action="?/logout">
								<Button class="w-full justify-start" variant="ghost" type="submit" size="sm"
									>Logout</Button
								>
							</form>
						{:else}
							<Button class="w-full justify-start" variant="ghost" href="/login" size="sm"
								>Sign In</Button
							>
						{/if}
						{#if $page.data.isAdmin}
							<Button class="w-full justify-start" variant="ghost" href="/admin" size="sm"
								>Admin</Button
							>
						{/if}
						<Button
							class="flex gap-2 w-full justify-start"
							on:click={toggleThemeMode}
							variant="ghost"
							size="sm"
						>
							{#if isDark}
								<Sun class="size-5" /> <span>Light</span>
							{:else}
								<Moon class="size-5" /> <span>Dark</span>
							{/if}
						</Button>
					</Popover.Content>
				</Popover.Root>
			{:else}
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
				<Button on:click={toggleThemeMode} variant="ghost" size="icon">
					{#if isDark}
						<Sun class="size-5" />
					{:else}
						<Moon class="size-5" />
					{/if}
				</Button>
			{/if}
		</div>
	</div>
</nav>
