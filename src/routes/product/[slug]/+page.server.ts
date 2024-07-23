import { db } from '$lib/server/db';
import { desc, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { productImages, products } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ params }) => {
	const firstProduct = await db.query.products.findFirst({
		where: eq(products.slug, params.slug),
		with: {
			images: {
				orderBy: desc(productImages.isPrimary)
			},
			variants: true,
			category: true,
			subcategory: true
		}
	});

	return {
		product: firstProduct
	};
};
