import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { schema } from './schema';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { categories } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';

export const load = async (event) => {
	const category = await db.query.categories.findFirst({
		where: eq(categories.slug, event.params.slug)
	});
	return {
		form: await superValidate(zod(schema), category && {
			defaults: category
		}),
		category
	};
};

export const actions = {
	update: async (event) => {
		const form = await superValidate(event, zod(schema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const { name, slug } = form.data;

		await db
			.update(categories)
			.set({
				name,
				slug
			})
			.where(eq(categories.slug, event.params.slug));

		redirect(301, '/admin/category');
	},
	delete: async (event) => {
		await db.delete(categories).where(eq(categories.slug, event.params.slug));

		redirect(301, '/admin/category');
	}
};
