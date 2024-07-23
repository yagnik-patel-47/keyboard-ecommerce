import { superValidate } from 'sveltekit-superforms';
import { formSchema } from './schema';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { subcategories } from '$lib/server/db/schema';

export const load = async () => {
	const allCategories = await db.query.categories.findMany();

	return {
		form: await superValidate(zod(formSchema)),
		allCategories
	};
};

export const actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(formSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const { name, slug, description, categoryId } = form.data;
		await db.insert(subcategories).values({
			name,
			slug,
			description,
			categoryId
		});
		redirect(301, '/admin/subcategory');
	}
};
