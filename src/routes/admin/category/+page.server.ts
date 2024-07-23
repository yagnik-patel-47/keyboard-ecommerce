import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const allCategories = await db.query.categories.findMany();

	return {
		categories: allCategories ?? []
	};
};
