import type { TCartEntry } from '$lib/client/cart';
import { stripe } from '$lib/server/stripe';
import { error, redirect } from '@sveltejs/kit';
import type Stripe from 'stripe';

export const actions = {
	default: async (event) => {
		const body = (await event.request.json()) as TCartEntry[];

		const user = event.locals.user;

		const customerId = user ? user.stripeCustomerId ?? undefined : undefined;

		// see if shipping should be added...
		const total = body.reduce((prev, curr) => {
			return {
				...prev,
				amount: prev.amount + curr.amount * curr.quantity
			};
		}).amount;

		const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
			...body.map((item) => {
				return {
					price: item.stripePriceId,
					quantity: item.quantity
				};
			})
		];

		if (total < 125) {
			// add shipping to total
			line_items.push({
				price_data: {
					currency: 'INR',
					product_data: {
						name: 'IN Shipping'
					},
					unit_amount: 15000
				},
				quantity: 1
			});
		}

		const session = await stripe.checkout.sessions.create({
			shipping_address_collection: {
				allowed_countries: ['IN']
			},
			line_items,
			customer: customerId,
			customer_creation: user && !customerId ? 'always' : undefined,
			customer_update: customerId
				? {
						shipping: 'auto'
					}
				: undefined,
			metadata: {
				codes: JSON.stringify(
					body.map((item) => ({
						quantity: item.quantity,
						productId: item.productId,
						code: item.code
					}))
				),
				userId: user ? user.id : ''
			},
			mode: 'payment',
			success_url: `${event.url.origin}/status/checkout/success`,
			cancel_url: `${event.url.origin}/status/checkout/fail`,
			billing_address_collection: 'required'
		});

		if (session.url) {
			redirect(307, session.url);
		}

		// TODO: make these errors not suck
		error(500);
	}
};
