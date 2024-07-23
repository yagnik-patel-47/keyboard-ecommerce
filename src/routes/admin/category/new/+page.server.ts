import { superValidate } from 'sveltekit-superforms';
import { formSchema } from './schema';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { categories } from '$lib/server/db/schema';

export const load = async () => {
	return {
		form: await superValidate(zod(formSchema))
	};
};

export const actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(formSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const { name, slug, description } = form.data;
		await db.insert(categories).values({
			name,
			slug,
			description
		});
		redirect(301, '/admin/category');
	}
};
