import { db } from '$lib/server/db';
import { products } from '$lib/server/db/schema.js';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load = async ({ params, url }) => {
	const firstProduct = await db.query.products.findFirst({
		where: eq(products.id, params.productId),
		with: {
			variants: true
		}
	});

	if (!firstProduct) {
		error(404);
	}

	return { productId: params.productId, product: firstProduct, url: url.pathname };
};
