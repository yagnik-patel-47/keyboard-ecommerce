<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { formSchema } from './schema';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Select from '$lib/components/ui/select';
	import type { PageData } from './$types';

	export let data: PageData;

	const form = superForm(data.form, {
		validators: zodClient(formSchema)
	});

	const { form: formData, enhance } = form;

	$: selectedCategory = {
		label: data.allCategories.find((cat) => cat.id === $formData.categoryId)?.name,
		value: $formData.categoryId
	};
</script>

<h1 class="text-3xl font-semibold">Add new subcategory</h1>
<form class="mt-8 space-y-4" method="POST" use:enhance>
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
</form>
