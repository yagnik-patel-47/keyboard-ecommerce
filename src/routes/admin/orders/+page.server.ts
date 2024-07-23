import { invalidate } from '$app/navigation';
import { db } from '$lib/server/db';
import { orders } from '$lib/server/db/schema.js';
import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load = async () => {
	const orders = await db.query.orderProducts.findMany({
		with: {
			order: true,
			product: {
				with: {
					rootProduct: true
				}
			}
		}
	});

	return {
		orders
	};
};

export const actions = {
	delete: async ({ url }) => {
		const orderId = url.searchParams.get('id');
		if (!orderId) return fail(401);

		await db.delete(orders).where(eq(orders.stripeOrderId, orderId));

		return { success: true };
	}
};
