import { db } from '$lib/server/db';
import { zod } from 'sveltekit-superforms/adapters';
import { updateSubcategorySchema } from './schema';
import { superValidate } from 'sveltekit-superforms';
import { fail } from '@sveltejs/kit';
import { subcategories } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load = async () => {
	const allSubCategories = await db.query.subcategories.findMany({
		with: {
			category: true
		}
	});
	const allCategories = await db.query.categories.findMany();

	return {
		form: await superValidate(zod(updateSubcategorySchema)),
		subcategories: allSubCategories,
		allCategories
	};
};

export const actions = {
	update: async (event) => {
		const subc_id = event.url.searchParams.get('id');
		if (!subc_id) return fail(401);

		const form = await superValidate(event, zod(updateSubcategorySchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		await db.update(subcategories).set(form.data).where(eq(subcategories.id, subc_id));

		return { success: true };
	},
	delete: async ({ url }) => {
		const subc_id = url.searchParams.get('id');
		if (!subc_id) return fail(401);

		await db.delete(subcategories).where(eq(subcategories.id, subc_id));

		return { success: true };
	}
};
