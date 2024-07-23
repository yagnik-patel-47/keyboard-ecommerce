<script lang="ts">
	import { page } from '$app/stores';
	import { invalidateAll, pushState } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardTitle, CardDescription, CardHeader } from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Drawer from '$lib/components/ui/drawer';
	import * as Select from '$lib/components/ui/select';
	import { Pencil } from 'lucide-svelte';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { updateSubcategorySchema } from './schema.js';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { applyAction, deserialize } from '$app/forms';
	import { mediaQuery } from 'svelte-legos';

	export let data;

	const isLargeScreen = mediaQuery('(min-width: 1024px)');

	const form = superForm(data.form, {
		validators: zodClient(updateSubcategorySchema)
	});
	const { form: formData, enhance } = form;

	$: selectedCategory = {
		label: data.allCategories.find((cat) => cat.id === $formData.categoryId)?.name,
		value: $formData.categoryId
	};

	function handleOpenModal(subc: (typeof data.subcategories)[number]) {
		formData.set(subc);
		pushState('', {
			subcategory: subc
		});
	}

	async function handleSubmit(event: { currentTarget: EventTarget & HTMLFormElement }) {
		const data = new FormData(event.currentTarget);

		const response = await fetch(event.currentTarget.action, {
			method: 'POST',
			body: data
		});

		const result = deserialize(await response.text());

		if (result.type === 'success') {
			// rerun all `load` functions, following the successful update
			await invalidateAll();
		}

		applyAction(result);
	}
</script>

<div class="flex justify-between items-center">
	<h1 class="text-2xl lg:text-3xl font-medium">Available Subcategories</h1>
	<Button href="/admin/subcategory/new" size="sm">Add Subcategory</Button>
</div>
<div class="space-y-4 mt-8">
	{#if data.subcategories.length}
		{#each data.subcategories as category}
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center justify-between">
						<span class="text-sm md:text-base"
							>{category.name} - ({category.slug}) from ({category.category.name})</span
						>
						<Button on:click={() => handleOpenModal(category)} size="icon" variant="outline"
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

{#if $isLargeScreen}
	<Dialog.Root
		onOpenChange={(state) => state === false && history.back()}
		open={!!$page.state.subcategory}
	>
		<Dialog.Trigger />
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Edit {$page.state.subcategory?.name} subcategory</Dialog.Title>
			</Dialog.Header>
			<form
				class="mt-8 space-y-4"
				method="POST"
				action={`?/update&id=${$page.state.subcategory?.id}`}
				use:enhance
			>
				<Form.Field {form} name="name">
					<Form.Control let:attrs>
						<Form.Label>Name</Form.Label>
						<Input class="max-w-xl" {...attrs} bind:value={$formData.name} />
					</Form.Control>
					<Form.Description>This is category name which will be displayed.</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="slug">
					<Form.Control let:attrs>
						<Form.Label>Slug</Form.Label>
						<Input class="max-w-xl" {...attrs} bind:value={$formData.slug} />
					</Form.Control>
					<Form.Description>This will be used in urls.</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="categoryId">
					<Form.Control let:attrs>
						<Form.Label>Parent Category</Form.Label>
						<Select.Root
							selected={selectedCategory}
							onSelectedChange={(s) => {
								s && ($formData.categoryId = s.value);
							}}
						>
							<Select.Input class="max-w-xl" name={attrs.name} />
							<Select.Trigger class="max-w-xl" {...attrs}>
								<Select.Value placeholder="Select a category" />
							</Select.Trigger>
							<Select.Content class="max-w-xl">
								{#each data.allCategories as category}
									<Select.Item value={category.id} label={category.name} />
								{/each}
							</Select.Content>
						</Select.Root>
					</Form.Control>
					<Form.Description>The category to which it will be a subcategory.</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="description">
					<Form.Control let:attrs>
						<Form.Label>Description</Form.Label>
						<Textarea class="max-w-xl" {...attrs} bind:value={$formData.description} />
					</Form.Control>
					<Form.Description>This is category description which will be displayed.</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Button on:click={() => history.back()}>Submit</Form.Button>
				<Form.Button formaction={`?/delete&id=${$page.state.subcategory?.id}`} variant="destructive"
					>Delete Subcategory</Form.Button
				>
			</form>
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<Drawer.Root
		onOpenChange={(state) => state === false && history.back()}
		open={!!$page.state.subcategory}
	>
		<Drawer.Content>
			<Drawer.Header class="text-left">
				<Drawer.Title>Edit {$page.state.subcategory?.name} subcategory</Drawer.Title>
			</Drawer.Header>
			<form
				class="my-4 space-y-4 px-4"
				method="POST"
				action={`?/update&id=${$page.state.subcategory?.id}`}
				use:enhance
			>
				<Form.Field {form} name="name">
					<Form.Control let:attrs>
						<Form.Label>Name</Form.Label>
						<Input class="max-w-xl" {...attrs} bind:value={$formData.name} />
					</Form.Control>
					<Form.Description>This is category name which will be displayed.</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="slug">
					<Form.Control let:attrs>
						<Form.Label>Slug</Form.Label>
						<Input class="max-w-xl" {...attrs} bind:value={$formData.slug} />
					</Form.Control>
					<Form.Description>This will be used in urls.</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="categoryId">
					<Form.Control let:attrs>
						<Form.Label>Parent Category</Form.Label>
						<Select.Root
							selected={selectedCategory}
							onSelectedChange={(s) => {
								s && ($formData.categoryId = s.value);
							}}
						>
							<Select.Input class="max-w-xl" name={attrs.name} />
							<Select.Trigger class="max-w-xl" {...attrs}>
								<Select.Value placeholder="Select a category" />
							</Select.Trigger>
							<Select.Content class="max-w-xl">
								{#each data.allCategories as category}
									<Select.Item value={category.id} label={category.name} />
								{/each}
							</Select.Content>
						</Select.Root>
					</Form.Control>
					<Form.Description>The category to which it will be a subcategory.</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="description">
					<Form.Control let:attrs>
						<Form.Label>Description</Form.Label>
						<Textarea class="max-w-xl" {...attrs} bind:value={$formData.description} />
					</Form.Control>
					<Form.Description>This is category description which will be displayed.</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Button>Submit</Form.Button>
				<Form.Button formaction={`?/delete&id=${$page.state.subcategory?.id}`} variant="destructive"
					>Delete Subcategory</Form.Button
				>
			</form>
		</Drawer.Content>
	</Drawer.Root>
{/if}
