<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { createProductSchema } from '../schema';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Select from '$lib/components/ui/select';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { CircleMinus, CirclePlus } from 'lucide-svelte';
	import { Checkbox } from '$lib/components/ui/checkbox';

	export let data;

	const form = superForm(data.form, {
		validators: zodClient(createProductSchema),
		dataType: 'json'
	});

	const { form: formData, enhance } = form;

	$formData.variants = [
		{
			name: '',
			code: '',
			stock: 0,
			price: 0,
			isDefault: true
		}
	];

	function addVariant() {
		$formData.variants = [
			...$formData.variants,
			{
				name: '',
				code: '',
				stock: 0,
				price: 0,
				isDefault: false
			}
		];
	}

	function removeVariant(index: number) {
		$formData.variants = $formData.variants.filter((_, i) => i !== index);
	}

	$: selectedCategory = {
		label: data.allCategories.find((cat) => cat.id === $formData.categoryId)?.name,
		value: $formData.categoryId
	};

	$: selectedSubCategory = {
		label: data.allCategories
			.flatMap((cat) => [...cat.subcategories])
			.find((cat) => cat.id === $formData.subcategoryId)?.name,
		value: $formData.subcategoryId
	};

	$: filteredSubCategories = data.allCategories.find(
		(cat) => cat.id === $formData.categoryId
	)?.subcategories;
</script>

<Breadcrumb.Root>
	<Breadcrumb.List>
		<Breadcrumb.Item>
			<Breadcrumb.Link href="/admin">Admin</Breadcrumb.Link>
		</Breadcrumb.Item>
		<Breadcrumb.Separator />
		<Breadcrumb.Item>
			<Breadcrumb.Link href="/admin/products">Products</Breadcrumb.Link>
		</Breadcrumb.Item>
		<Breadcrumb.Separator />
		<Breadcrumb.Item>
			<Breadcrumb.Page>Add Product</Breadcrumb.Page>
		</Breadcrumb.Item>
	</Breadcrumb.List>
</Breadcrumb.Root>

<h1 class="text-2xl font-semibold mt-8">Add new products</h1>
<form class="mt-8 space-y-4" method="POST" use:enhance>
	<Form.Field {form} name="name">
		<Form.Control let:attrs>
			<Form.Label>Name</Form.Label>
			<Input class="max-w-xl" {...attrs} bind:value={$formData.name} />
		</Form.Control>
		<Form.Description>The product name which will be displayed.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="slug">
		<Form.Control let:attrs>
			<Form.Label>Slug</Form.Label>
			<Input class="max-w-xl" {...attrs} bind:value={$formData.slug} />
		</Form.Control>
		<Form.Description>The product slug which will be used for url.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>

	<Card.Root class="max-w-5xl">
		<Card.Header>
			<Card.Title>Stock</Card.Title>
			<Card.Description>Variants and stock</Card.Description>
		</Card.Header>
		<Card.Content>
			<Form.Fieldset {form} name="variants">
				<table class="w-full">
					<thead>
						<tr class="border-b transition-colors hover:bg-muted/50">
							<th
								class="h-12 px-4 w-80 text-left align-middle font-medium text-muted-foreground text-sm"
								>Name</th
							>
							<th
								class="h-12 px-4 w-40 text-left align-middle font-medium text-muted-foreground text-sm"
								>Code</th
							>
							<th
								class="h-12 px-4 w-40 text-left align-middle font-medium text-muted-foreground text-sm"
								>Stock</th
							>
							<th
								class="h-12 px-4 w-40 text-left align-middle font-medium text-muted-foreground text-sm"
								>Price</th
							>
							<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground text-sm"
								>Default</th
							>
						</tr>
					</thead>
					<tbody class="[&_tr:last-child]:border-0">
						{#each $formData.variants as _, index}
							<tr class="border-b transition-colors hover:bg-muted/50">
								<td class="align-middle p-4">
									<Form.ElementField {form} name="variants[{index}].name">
										<Form.Control let:attrs>
											<Form.Label class="sr-only">Name</Form.Label>
											<Input {...attrs} bind:value={$formData.variants[index].name} />
										</Form.Control>
										<Form.FieldErrors />
									</Form.ElementField>
								</td>
								<td class="align-middle p-4">
									<Form.ElementField {form} name="variants[{index}].code">
										<Form.Control let:attrs>
											<Form.Label class="sr-only">Code</Form.Label>
											<Input {...attrs} bind:value={$formData.variants[index].code} />
										</Form.Control>
										<Form.FieldErrors />
									</Form.ElementField>
								</td>
								<td class="p-4 align-middle">
									<Form.ElementField {form} name="variants[{index}].stock">
										<Form.Control let:attrs>
											<Form.Label class="sr-only">Stock</Form.Label>
											<Input
												{...attrs}
												type="number"
												bind:value={$formData.variants[index].stock}
											/>
										</Form.Control>
										<Form.FieldErrors />
									</Form.ElementField>
								</td>
								<td class="p-4 align-middle">
									<Form.ElementField {form} name="variants[{index}].price">
										<Form.Control let:attrs>
											<Form.Label class="sr-only">Price</Form.Label>
											<Input
												{...attrs}
												type="number"
												bind:value={$formData.variants[index].price}
											/>
										</Form.Control>
										<Form.FieldErrors />
									</Form.ElementField>
								</td>
								<td class="p-4 align-middle">
									<Form.ElementField {form} name="variants[{index}].isDefault">
										<Form.Control let:attrs>
											<Form.Label class="sr-only">Default</Form.Label>
											<Checkbox
												{...attrs}
												bind:checked={$formData.variants[index].isDefault}
												aria-labelledby="is default"
												class=""
											/>
										</Form.Control>
										<Form.FieldErrors />
									</Form.ElementField>
								</td>
								{#if $formData.variants.length > 1}
									<td>
										<Button
											on:click={() => removeVariant(index)}
											variant="ghost"
											type="button"
											size="icon"
											class="mx-2"
										>
											<CircleMinus class="size-5" />
										</Button>
									</td>
								{/if}
							</tr>
						{/each}
					</tbody>
				</table>
			</Form.Fieldset>
		</Card.Content>
		<Card.Footer class="justify-center border-t p-4">
			<Button type="button" on:click={addVariant} size="sm" variant="ghost" class="gap-1">
				<CirclePlus class="h-3.5 w-3.5" />
				Add Variant
			</Button>
		</Card.Footer>
	</Card.Root>

	<Form.Field {form} name="categoryId">
		<Form.Control let:attrs>
			<Form.Label>Category</Form.Label>
			<Select.Root
				selected={selectedCategory}
				onSelectedChange={(s) => {
					s && ($formData.categoryId = s.value);
					$formData.subcategoryId = undefined;
					selectedSubCategory = {
						label: undefined,
						value: undefined
					};
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
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="subcategoryId">
		<Form.Control let:attrs>
			<Form.Label>Subcategory</Form.Label>
			<Select.Root
				selected={selectedSubCategory}
				onSelectedChange={(s) => {
					s && ($formData.subcategoryId = s.value);
				}}
				disabled={!$formData.categoryId}
			>
				<Select.Input class="max-w-xl" name={attrs.name} />
				<Select.Trigger class="max-w-xl" {...attrs}>
					<Select.Value placeholder="Select a subcategory" />
				</Select.Trigger>
				<Select.Content class="max-w-xl">
					{#if filteredSubCategories}
						{#each filteredSubCategories as category}
							<Select.Item value={category.id} label={category.name} />
						{/each}
					{/if}
				</Select.Content>
			</Select.Root>
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="description">
		<Form.Control let:attrs>
			<Form.Label>Description (supports html format)</Form.Label>
			<Textarea class="max-w-xl" {...attrs} bind:value={$formData.description} />
		</Form.Control>
		<Form.Description>The product description which will be displayed.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="specifications">
		<Form.Control let:attrs>
			<Form.Label>Specifications (supports html format)</Form.Label>
			<Textarea class="max-w-xl" {...attrs} bind:value={$formData.specifications} />
		</Form.Control>
		<Form.Description>The product specifications which will be displayed.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="addDetails">
		<Form.Control let:attrs>
			<Form.Label>Additional details (supports html format)</Form.Label>
			<Textarea class="max-w-xl" {...attrs} bind:value={$formData.addDetails} />
		</Form.Control>
		<Form.Description>The additional details which will be displayed.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Button>Submit</Form.Button>
</form>
