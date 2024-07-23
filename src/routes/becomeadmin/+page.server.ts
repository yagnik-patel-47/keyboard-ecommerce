import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load = async (event) => {
	if (!event.locals.session) return redirect(301, '/login');

	const user = await db
		.update(users)
		.set({
			isAdmin: true
		})
		.where(eq(users.id, event.locals.user?.id ?? ''))
		.returning();

	return {
		success: user[0].isAdmin ? true : false
	};
};
