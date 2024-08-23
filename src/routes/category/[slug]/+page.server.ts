import { db } from '$lib/server/db';
import {
	categories,
	productImages,
	products,
	productVariants,
	subcategories
} from '$lib/server/db/schema';
import { and, eq, inArray, sql } from 'drizzle-orm';

export const load = async (event) => {
	const categorySlug = event.params.slug;
	const subcategory = event.url.searchParams.get('sub');
	const range = event.url.searchParams.get('range')?.split('-');
	const order = event.url.searchParams.get('order');

	const category = await db.query.categories.findFirst({
		where: eq(categories.slug, categorySlug),
		with: {
			subcategories: true,
			products: {
				with: {
					variants: true
				}
			}
		}
	});

	const allFilteredproducts = await db.query.products.findMany({
		where: and(
			inArray(
				products.categoryId,
				db
					.select({ id: categories.id })
					.from(categories)
					.where(sql`${categories.slug} = ${categorySlug}`)
			),
			subcategory
				? inArray(
						products.subcategoryId,
						db
							.select({ id: subcategories.id })
							.from(subcategories)
							.where(sql`${subcategories.slug} = ${subcategory}`)
					)
				: undefined,
			range &&
				inArray(
					products.id,
					db
						.select({ id: productVariants.productId })
						.from(productVariants)
						.where(sql`${productVariants.price} >= ${range[0]}`)
				),
			range &&
				inArray(
					products.id,
					db
						.select({ id: productVariants.productId })
						.from(productVariants)
						.where(sql`${productVariants.price} <= ${range[1]}`)
				)
		),
		with: {
			variants: true,
			images: {
				where: sql`${productImages.isPrimary} = true`
			}
		}
	});

	return {
		category,
		products: allFilteredproducts
	};
};
