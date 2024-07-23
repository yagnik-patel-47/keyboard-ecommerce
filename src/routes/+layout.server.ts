import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = (event) => {
	return {
		userEmail: event.locals.user?.email,
		isAdmin: event.locals.user?.isAdmin
	};
};
