<script lang="ts">
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import { Button } from '$lib/components/ui/button';
	import { ChevronLeft, CirclePlus, Upload, CircleMinus, Check } from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Select from '$lib/components/ui/select';
	import { updateProductSchema, status } from '../schema';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Form from '$lib/components/ui/form';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { CldImage, CldUploadButton } from 'svelte-cloudinary';
	import { env } from '$env/dynamic/public';
	import { deserialize } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { cn, getHeightFromAspect } from '$lib/utils';

	export let data;

	const form = superForm(data.form, {
		validators: zodClient(updateProductSchema),
		dataType: 'json'
	});

	const { form: formData, enhance } = form;

	$formData.name = data.product.name;
	$formData.slug = data.product.slug;
	$formData.description = data.product.description;
	$formData.specifications = data.product.specifications;
	$formData.addDetails = data.product.addDetails;
	$formData.status = data.product.status!;
	$formData.variants = data.product.variants;
	$formData.newVariants = [];
	$formData.categoryId = data.product.categoryId!;
	$formData.subcategoryId = data.product.subcategoryId;

	function addVariant() {
		$formData.newVariants = [
			...$formData.newVariants,
			{
				name: '',
				code: '',
				stock: 0,
				price: 0,
				isDefault: false
			}
		];
	}

	function removeVariant(index: number, fromNewVariants = false) {
		if (!fromNewVariants) $formData.variants = $formData.variants.filter((_, i) => i !== index);
		else $formData.newVariants = $formData.newVariants.filter((_, i) => i !== index);
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

	$: selectedStatus = {
		label: status[$formData.status],
		value: $formData.status
	};

	async function handleImageOperation(type: string, data: Record<string, string>) {
		const formData = new FormData();
		for (const [name, value] of Object.entries(data)) {
			formData.append(name, value);
		}
		let endpoint: string;

		switch (type) {
			case 'create':
				endpoint = 'createImage';
				break;
			case 'setAspect':
				endpoint = 'setImageAspect';
				break;
			case 'makePrimary':
				endpoint = 'makeImagePrimary';
				break;
			case 'delete':
				endpoint = 'deleteImage';
				break;

			default:
				console.error('No Endpoint for ' + type);
				return;
		}

		const response = await fetch(`/admin/products/${data.productId}?/${endpoint}`, {
			method: 'POST',
			body: formData
		});

		const result = deserialize(await response.text());

		if (result.type === 'success') {
			await invalidateAll();
		}
	}
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
			<Breadcrumb.Page>Edit Product</Breadcrumb.Page>
		</Breadcrumb.Item>
	</Breadcrumb.List>
</Breadcrumb.Root>

<form method="POST" action="?/updateProduct" use:enhance>
	<main class="grid items-start gap-4 sm:py-0 md:gap-8 mt-12">
		<div class="mx-auto grid flex-1 auto-rows-max gap-4 w-full">
			<div class="flex items-center gap-4">
				<Button href="/admin/products" variant="outline" size="icon" class="size-8">
					<ChevronLeft class="size-4" />
					<span class="sr-only">Back</span>
				</Button>
				<h1
					class="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0"
				>
					{data.product.name}
				</h1>
				<div class="hidden items-center gap-2 md:ml-auto md:flex">
					<Button href="/admin/products" variant="ghost" size="sm">Discard</Button>
					<Button type="submit" size="sm">Save Product</Button>
				</div>
			</div>
			<div class="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
				<div class="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
					<Card.Root>
						<Card.Header>
							<Card.Title>Product Details</Card.Title>
						</Card.Header>
						<Card.Content>
							<div class="grid xl:grid-cols-2 gap-6">
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

								<Form.Field {form} name="description">
									<Form.Control let:attrs>
										<Form.Label>Description (supports html)</Form.Label>
										<Textarea class="max-w-xl" {...attrs} bind:value={$formData.description} />
									</Form.Control>
									<Form.Description
										>The product description which will be displayed.</Form.Description
									>
									<Form.FieldErrors />
								</Form.Field>

								<Form.Field {form} name="specifications">
									<Form.Control let:attrs>
										<Form.Label>Specifications (supports html)</Form.Label>
										<Textarea class="max-w-xl" {...attrs} bind:value={$formData.specifications} />
									</Form.Control>
									<Form.Description
										>The product specifications which will be displayed.</Form.Description
									>
									<Form.FieldErrors />
								</Form.Field>

								<Form.Field {form} name="addDetails">
									<Form.Control let:attrs>
										<Form.Label>Additional details (supports html)</Form.Label>
										<Textarea class="max-w-xl" {...attrs} bind:value={$formData.addDetails} />
									</Form.Control>
									<Form.Description
										>The additional details which will be displayed.</Form.Description
									>
									<Form.FieldErrors />
								</Form.Field>
							</div>
						</Card.Content>
					</Card.Root>
					<Card.Root>
						<Card.Header>
							<Card.Title>Stock</Card.Title>
							<Card.Description>Lipsum dolor sit amet, consectetur adipiscing elit</Card.Description
							>
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
											<th
												class="h-12 px-4 text-left align-middle font-medium text-muted-foreground text-sm"
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
												{#if [...$formData.variants, ...$formData.newVariants].length > 1}
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
										{#each $formData.newVariants as _, index}
											<tr class="border-b transition-colors hover:bg-muted/50">
												<td class="align-middle p-4">
													<Form.ElementField {form} name="newVariants[{index}].name">
														<Form.Control let:attrs>
															<Form.Label class="sr-only">Name</Form.Label>
															<Input {...attrs} bind:value={$formData.newVariants[index].name} />
														</Form.Control>
														<Form.FieldErrors />
													</Form.ElementField>
												</td>
												<td class="align-middle p-4">
													<Form.ElementField {form} name="newVariants[{index}].code">
														<Form.Control let:attrs>
															<Form.Label class="sr-only">Code</Form.Label>
															<Input {...attrs} bind:value={$formData.newVariants[index].code} />
														</Form.Control>
														<Form.FieldErrors />
													</Form.ElementField>
												</td>
												<td class="p-4 align-middle">
													<Form.ElementField {form} name="newVariants[{index}].stock">
														<Form.Control let:attrs>
															<Form.Label class="sr-only">Stock</Form.Label>
															<Input
																{...attrs}
																type="number"
																bind:value={$formData.newVariants[index].stock}
															/>
														</Form.Control>
														<Form.FieldErrors />
													</Form.ElementField>
												</td>
												<td class="p-4 align-middle">
													<Form.ElementField {form} name="newVariants[{index}].price">
														<Form.Control let:attrs>
															<Form.Label class="sr-only">Price</Form.Label>
															<Input
																{...attrs}
																type="number"
																bind:value={$formData.newVariants[index].price}
															/>
														</Form.Control>
														<Form.FieldErrors />
													</Form.ElementField>
												</td>
												<td class="p-4 align-middle">
													<Form.ElementField {form} name="newVariants[{index}].isDefault">
														<Form.Control let:attrs>
															<Form.Label class="sr-only">Default</Form.Label>
															<Checkbox
																{...attrs}
																bind:checked={$formData.newVariants[index].isDefault}
																aria-labelledby="is default"
																class=""
															/>
														</Form.Control>
														<Form.FieldErrors />
													</Form.ElementField>
												</td>
												{#if [...$formData.variants, ...$formData.newVariants].length > 1}
													<td>
														<Button
															on:click={() => removeVariant(index, true)}
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
							<Button on:click={addVariant} size="sm" variant="ghost" class="gap-1">
								<CirclePlus class="h-3.5 w-3.5" />
								Add Variant
							</Button>
						</Card.Footer>
					</Card.Root>
					<Card.Root
						data-x-chunk-name="dashboard-07-chunk-2"
						data-x-chunk-description="A card with a form to edit the product category and subcategory"
					>
						<Card.Header>
							<Card.Title>Product Category</Card.Title>
						</Card.Header>
						<Card.Content>
							<div class="grid gap-6 sm:grid-cols-3">
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
							</div>
						</Card.Content>
					</Card.Root>
				</div>
				<div class="grid auto-rows-max items-start gap-4 lg:gap-8">
					<Card.Root>
						<Card.Header>
							<Card.Title>Product Status</Card.Title>
						</Card.Header>
						<Card.Content>
							<div class="grid gap-6">
								<Form.Field {form} name="status">
									<Form.Control let:attrs>
										<Form.Label>Status</Form.Label>
										<Select.Root
											selected={selectedStatus}
											onSelectedChange={(s) => {
												s && ($formData.status = s.value);
											}}
										>
											<Select.Input class="max-w-xl" name={attrs.name} />
											<Select.Trigger class="max-w-xl" {...attrs}>
												<Select.Value placeholder="Select status" />
											</Select.Trigger>
											<Select.Content class="max-w-xl">
												{#each Object.entries(status) as [value, label]}
													<Select.Item {value} {label} />
												{/each}
											</Select.Content>
										</Select.Root>
									</Form.Control>
									<Form.FieldErrors />
								</Form.Field>
							</div>
						</Card.Content>
					</Card.Root>
					<Card.Root
						class="overflow-hidden"
						data-x-chunk-name="dashboard-07-chunk-4"
						data-x-chunk-description="A card with a form to upload product images"
					>
						<Card.Header>
							<Card.Title>Product Images</Card.Title>
							<Card.Description>Edit primary image and orientation</Card.Description>
						</Card.Header>
						<Card.Content>
							<div class="grid gap-2">
								{#if !!data.product.images.filter((image) => image.isPrimary)[0]}
									<div
										class={cn(
											'size-full rounded-md overflow-hidden relative group aspect-square',
											data.product.images.filter((image) => image.isPrimary)[0].aspect ===
												'horizontal' && 'aspect-[16/11]',
											data.product.images.filter((image) => image.isPrimary)[0].aspect ===
												'vertical' && 'aspect-[3/4]'
										)}
									>
										<CldImage
											alt={data.product.images.filter((image) => image.isPrimary)[0].cloudinaryId}
											src={data.product.images.filter((image) => image.isPrimary)[0].cloudinaryId}
											width={600}
											height={getHeightFromAspect(
												data.product.images.filter((image) => image.isPrimary)[0].aspect,
												600
											)}
											objectFit="cover"
										/>
										<DropdownMenu.Root>
											<DropdownMenu.Trigger
												class="absolute inset-0 bg-black/70 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition text-white font-medium"
												>Change Aspect Ratio</DropdownMenu.Trigger
											>
											<DropdownMenu.Content>
												<DropdownMenu.Group>
													<DropdownMenu.Item
														on:click={() =>
															handleImageOperation('setAspect', {
																cloudinaryId: data.product.images.filter(
																	(image) => image.isPrimary
																)[0].cloudinaryId,
																aspect: 'square'
															})}
													>
														{#if data.product.images.filter((image) => image.isPrimary)[0].aspect === 'square'}
															<Check class="size-3 mr-2" />
														{/if}
														<span>Square</span>
													</DropdownMenu.Item>
													<DropdownMenu.Item
														on:click={() =>
															handleImageOperation('setAspect', {
																cloudinaryId: data.product.images.filter(
																	(image) => image.isPrimary
																)[0].cloudinaryId,
																aspect: 'horizontal'
															})}
													>
														{#if data.product.images.filter((image) => image.isPrimary)[0].aspect === 'horizontal'}
															<Check class="size-3 mr-2" />
														{/if}
														<span>Horizontal</span>
													</DropdownMenu.Item>
													<DropdownMenu.Item
														on:click={() =>
															handleImageOperation('setAspect', {
																cloudinaryId: data.product.images.filter(
																	(image) => image.isPrimary
																)[0].cloudinaryId,
																aspect: 'vertical'
															})}
													>
														{#if data.product.images.filter((image) => image.isPrimary)[0].aspect === 'vertical'}
															<Check class="size-3 mr-2" />
														{/if}
														<span>Vertical</span>
													</DropdownMenu.Item>
												</DropdownMenu.Group>
											</DropdownMenu.Content>
										</DropdownMenu.Root>
									</div>
								{/if}
								<div class="grid grid-cols-3 gap-2">
									{#each data.product.images.filter((image) => !image.isPrimary) as image}
										<div
											class="rounded-md overflow-hidden relative group flex justify-center items-center"
										>
											<CldImage
												alt={image.cloudinaryId}
												src={image.cloudinaryId}
												width={150}
												height={getHeightFromAspect(image.aspect, 150)}
												objectFit="cover"
											/>
											<div
												class="absolute inset-0 bg-black group-hover:opacity-70 opacity-0 transition flex justify-center items-center invisible group-hover:visible"
											>
												<DropdownMenu.Root>
													<DropdownMenu.Trigger
														type="button"
														class="flex-1 h-full text-sm text-white font-medium"
														>Manage</DropdownMenu.Trigger
													>
													<DropdownMenu.Content>
														<DropdownMenu.Group>
															<DropdownMenu.Label>Edit Properties</DropdownMenu.Label>
															<DropdownMenu.Separator />
															<DropdownMenu.Item
																on:click={() =>
																	handleImageOperation('makePrimary', {
																		cloudinaryId: image.cloudinaryId,
																		aspect: image.aspect ?? 'square',
																		productId: data.product.id,
																		stripeProductIds: data.product.variants
																			.map((v) => v.stripeProductId)
																			.join(',')
																	})}>Make Primary</DropdownMenu.Item
															>
															<DropdownMenu.Sub>
																<DropdownMenu.SubTrigger>
																	<span>Aspect Ratio</span>
																</DropdownMenu.SubTrigger>
																<DropdownMenu.SubContent>
																	<DropdownMenu.Item
																		on:click={() =>
																			handleImageOperation('setAspect', {
																				cloudinaryId: image.cloudinaryId,
																				aspect: 'square'
																			})}
																	>
																		{#if image.aspect === 'square'}
																			<Check class="size-3 mr-2" />
																		{/if}
																		<span>Square</span>
																	</DropdownMenu.Item>
																	<DropdownMenu.Item
																		on:click={() =>
																			handleImageOperation('setAspect', {
																				cloudinaryId: image.cloudinaryId,
																				aspect: 'horizontal'
																			})}
																	>
																		{#if image.aspect === 'horizontal'}
																			<Check class="size-3 mr-2" />
																		{/if}
																		<span>Horizontal</span>
																	</DropdownMenu.Item>
																	<DropdownMenu.Item
																		on:click={() =>
																			handleImageOperation('setAspect', {
																				cloudinaryId: image.cloudinaryId,
																				aspect: 'vertical'
																			})}
																	>
																		{#if image.aspect === 'vertical'}
																			<Check class="size-3 mr-2" />
																		{/if}
																		<span>Vertical</span>
																	</DropdownMenu.Item>
																</DropdownMenu.SubContent>
															</DropdownMenu.Sub>
															<DropdownMenu.Item
																on:click={() =>
																	handleImageOperation('delete', {
																		cloudinaryId: image.cloudinaryId
																	})}>Delete</DropdownMenu.Item
															>
														</DropdownMenu.Group>
													</DropdownMenu.Content>
												</DropdownMenu.Root>
											</div>
										</div>
									{/each}
									<CldUploadButton
										uploadPreset={env.PUBLIC_CLOUDINARY_UPLOAD_PRESET}
										signatureEndpoint="/api/cloudinary"
										class="px-4 py-2 rounded-lg bg-transparent text-neutral-900 dark:text-neutral-200 font-semibold border border-muted-foreground border-dashed grid place-content-center min-h-24 min-w-24 aspect-square"
										onUpload={(res) => {
											if (res.event === 'success' && res.info && typeof res.info === 'object') {
												handleImageOperation('create', {
													// @ts-ignore
													cloudinaryId: res.info.public_id,
													productId: data.product.id
												});
												// handleSubmit(res.info);
											}
										}}
									>
										<Upload class="size-5 text-muted-foreground" />
										<span class="sr-only">Upload</span>
									</CldUploadButton>
								</div>
							</div>
						</Card.Content>
					</Card.Root>
				</div>
			</div>
			<div class="flex items-center justify-center gap-2 md:hidden">
				<Button variant="outline" size="sm">Discard</Button>
				<Button size="sm">Save Product</Button>
			</div>
		</div>
	</main>
</form>
