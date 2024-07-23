import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { lucia } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { productImages, productVariants, products } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const activeProducts = await db.query.products.findMany({
		with: {
			images: {
				where: eq(productImages.isPrimary, true)
			},
			category: true,
			subcategory: true,
			variants: {
				where: eq(productVariants.isDefault, true)
			}
		},
		where: eq(products.status, 'active')
	});

	return {
		products: activeProducts
	};
};

export const actions: Actions = {
	logout: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}
		await lucia.invalidateSession(event.locals.session.id);
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
		redirect(302, '/');
	}
};
