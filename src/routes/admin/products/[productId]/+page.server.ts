import { db } from '$lib/server/db';
import { productImages, products, productVariants } from '$lib/server/db/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { updateProductSchema } from '../schema.js';
import { getCldImageUrl } from 'svelte-cloudinary';
import { stripe } from '$lib/server/stripe.js';
import { v2 as cloudinary } from 'cloudinary';
import { getHeightFromAspect } from '$lib/utils';

export const load = async ({ params }) => {
	const product = await db.query.products.findFirst({
		where: eq(products.id, params.productId),
		with: {
			category: true,
			subcategory: true,
			images: true,
			variants: {
				columns: {
					createdAt: false,
					updatedAt: false
				}
			}
		}
	});

	const allCategories = await db.query.categories.findMany({
		with: {
			subcategories: true
		}
	});

	if (!product) {
		error(404, {
			message: 'Not product found'
		});
	}

	const { images, subcategory, category, updatedAt, createdAt, ...restProduct } = product;

	return {
		form: await superValidate(zod(updateProductSchema), {
			defaults: {
				name: product.name,
				slug: product.slug,
				description: product.description,
				specifications: product.specifications,
				addDetails: product.addDetails,
				status: product.status ?? 'draft',
				variants: product.variants,
				newVariants: [],
				categoryId: product.categoryId!,
				subcategoryId: product.subcategoryId
			}
		}),
		product,
		allCategories
	};
};

export const actions = {
	updateProduct: async (event) => {
		const form = await superValidate(event, zod(updateProductSchema));
		if (!form.valid) {
			console.log(form.errors);
			return fail(400, { form });
		}

		const { variants, newVariants, ...rootProduct } = form.data;

		for (const variant of variants) {
			await db.update(productVariants).set(variant).where(eq(productVariants.id, variant.id));
			if (variant.stripeProductId) {
				await stripe.products.update(variant.stripeProductId, {
					name:
						variant.name === '' || variant.name === 'default'
							? form.data.name
							: `${form.data.name} (${variant.name})`,
					metadata: {
						code: variant.code
					}
				});
			}
		}

		for (const variant of newVariants) {
			const newProduct = await stripe.products.create({
				name:
					variant.name === '' || variant.name === 'default'
						? form.data.name
						: `${form.data.name} (${variant.name})`,
				shippable: true,
				default_price_data: {
					currency: 'INR',
					unit_amount: Number(variant.price) * 100
				},
				metadata: {
					code: variant.code
				}
			});

			await db.insert(productVariants).values({
				...variant,
				productId: event.params.productId,
				stripePriceId: String(newProduct.default_price),
				stripeProductId: newProduct.id
			});
		}

		await db.update(products).set(rootProduct).where(eq(products.id, event.params.productId));

		redirect(301, '/admin/products');
	},
	setImageAspect: async (event) => {
		const formData = await event.request.formData();

		const cloudinaryId = formData.get('cloudinaryId')?.toString();
		const aspect = formData.get('aspect')?.toString() as 'square' | 'vertical' | 'horizontal';
		if (!cloudinaryId || !aspect) return fail(401);

		await db
			.update(productImages)
			.set({
				aspect
			})
			.where(eq(productImages.cloudinaryId, cloudinaryId));

		return { success: true };
	},
	makeImagePrimary: async (event) => {
		const formData = await event.request.formData();

		const cloudinaryId = formData.get('cloudinaryId')?.toString();
		const aspect = formData.get('aspect')?.toString() as any;
		const stripeProductIds = formData.get('stripeProductIds')?.toString();
		const productId = formData.get('productId')?.toString();

		if (!cloudinaryId || !aspect || !productId) return fail(401);

		const imageUrl = getCldImageUrl({
			width: 500,
			height: getHeightFromAspect(aspect, 500),
			src: cloudinaryId
		});

		if (stripeProductIds) {
			const ids = stripeProductIds.split(',');
			for (const id of ids) {
				await stripe.products.update(id, {
					images: [imageUrl]
				});
			}
		}

		await db
			.update(productImages)
			.set({
				isPrimary: false
			})
			.where(eq(productImages.productId, productId));

		await db
			.update(productImages)
			.set({
				isPrimary: true
			})
			.where(eq(productImages.cloudinaryId, cloudinaryId));

		return { success: true };
	},
	deleteImage: async (event) => {
		const formData = await event.request.formData();

		const cloudinaryId = formData.get('cloudinaryId')?.toString();
		if (!cloudinaryId) return fail(401);

		await db.delete(productImages).where(eq(productImages.cloudinaryId, cloudinaryId));

		return { success: true };
	},
	createImage: async (event) => {
		const formData = await event.request.formData();

		const cloudinaryId = formData.get('cloudinaryId')?.toString();
		const productId = formData.get('productId')?.toString();
		if (!cloudinaryId) return fail(401);

		await db.insert(productImages).values({
			cloudinaryId: cloudinaryId,
			productId: productId
		});

		return { success: true };
	},
	delete: async (event) => {
		const product = await db.query.products.findFirst({
			where: eq(products.id, event.params.productId),
			with: {
				images: true,
				variants: true
			}
		});
		if (!product) return fail(401);

		const imagesPublicIds = product.images.map((image) => image.cloudinaryId);

		try {
			await cloudinary.api.delete_resources(imagesPublicIds);
		} catch (error) {}

		for (const cloudinaryId of imagesPublicIds) {
			await db.delete(productImages).where(eq(productImages.cloudinaryId, cloudinaryId));
		}

		for (const variant of product.variants) {
			await db.delete(productVariants).where(eq(productVariants.id, variant.id));
		}

		await db.delete(products).where(eq(products.id, product.id));

		return { success: true };
	}
};
