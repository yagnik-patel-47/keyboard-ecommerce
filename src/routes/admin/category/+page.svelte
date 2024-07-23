<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardTitle, CardDescription, CardHeader } from '$lib/components/ui/card';
	import type { PageData } from './$types';
	import { Pencil } from 'lucide-svelte';

	export let data: PageData;
</script>

<div class="flex justify-between items-center">
	<h1 class="text-3xl font-medium">Available Categories</h1>
	<Button href="/admin/category/new" size="sm">Add Category</Button>
</div>
<div class="space-y-4 mt-8">
	{#if data.categories.length}
		{#each data.categories as category}
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center justify-between">
						<span>{category.name} - ({category.slug})</span>
						<Button href={`/admin/category/${category.slug}`} size="icon" variant="outline"
							><Pencil class="size-4" /></Button
						>
					</CardTitle>
					{#if category.description}
						<CardDescription>
							{category.description}
						</CardDescription>
					{/if}
				</CardHeader>
			</Card>
		{/each}
	{:else}
		<p class="text-xl text-center">No categories to list!</p>
	{/if}
</div>
