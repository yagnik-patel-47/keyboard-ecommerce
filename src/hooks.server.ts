import { lucia } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(lucia.sessionCookieName);
	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		if (event.url.pathname.startsWith('/admin'))
			return new Response(null, {
				status: 303,
				headers: {
					Location: '/'
				}
			});
		return resolve(event);
	}

	const { session, user } = await lucia.validateSession(sessionId);
	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		// sveltekit types deviates from the de-facto standard
		// you can use 'as any' too
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}
	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}
	event.locals.user = user;
	event.locals.session = session;

	if (event.url.pathname.startsWith('/admin')) {
		if (!event.locals.user || !event.locals.session) {
			return new Response(null, {
				status: 303,
				headers: {
					Location: '/login'
				}
			});
		}

		if (!event.locals.user.isAdmin) {
			return new Response(null, {
				status: 303,
				headers: {
					Location: '/'
				}
			});
		}
	}
	return resolve(event);
};
