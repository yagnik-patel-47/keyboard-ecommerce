import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { productImages, productVariants } from '$lib/server/db/schema';

export const load = async () => {
	const products = await db.query.products.findMany({
		with: {
			images: {
				where: eq(productImages.isPrimary, true)
			},
			variants: {
				where: eq(productVariants.isDefault, true)
			},
			category: true,
			subcategory: true
		}
	});

	return {
		products
	};
};
