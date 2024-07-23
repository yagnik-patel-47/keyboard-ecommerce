import { superValidate } from 'sveltekit-superforms';
import { createProductSchema } from '../schema';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { productVariants, products } from '$lib/server/db/schema';
import { stripe } from '$lib/server/stripe';

export const load = async () => {
	const allCategories = await db.query.categories.findMany({
		with: {
			subcategories: true
		}
	});

	return {
		form: await superValidate(zod(createProductSchema)),
		allCategories
	};
};

export const actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(createProductSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const baseProduct = await db
			.insert(products)
			.values(form.data)
			.returning({ productId: products.id });

		const promises = form.data.variants.map(async (variant) => {
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

			try {
				await db.insert(productVariants).values({
					...variant,
					productId: baseProduct[0].productId,
					stripePriceId: String(newProduct.default_price),
					stripeProductId: newProduct.id
				});
			} catch (error: any) {
				if (error.code === '23505' && error.table_name === 'product_variants')
					fail(406, { error: true, msg: `${variant.code} is already used!` });
			}
		});

		await Promise.all(promises);
		redirect(301, `/admin/products/${baseProduct[0].productId}`);
	}
};
