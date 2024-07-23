import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { orderProducts, orders, users } from '$lib/server/db/schema';
import { stripe } from '$lib/server/stripe';
import { eq } from 'drizzle-orm';
import type Stripe from 'stripe';

function toBuffer(ab: ArrayBuffer): Buffer {
	const buf = Buffer.alloc(ab.byteLength);
	const view = new Uint8Array(ab);
	for (let i = 0; i < buf.length; i++) {
		buf[i] = view[i];
	}
	return buf;
}

export const POST = async ({ request }) => {
	const endpointSecret = env.STRIPE_WEBHOOK_SECRET!;

	const _rawBody = await request.arrayBuffer();
	const payload = toBuffer(_rawBody);

	const header = stripe.webhooks.generateTestHeaderString({
		payload: payload.toString(),
		secret: endpointSecret
	});

	const signature = request.headers.get('stripe-signature') ?? '';

	try {
		const event = stripe.webhooks.constructEvent(payload, header, endpointSecret);
		const eventType = event.type;

		if (eventType === 'checkout.session.completed') {
			const sessionWithCustomer = await stripe.checkout.sessions.retrieve(event.data.object.id, {
				expand: ['customer']
			});

			if (sessionWithCustomer.metadata && sessionWithCustomer.customer) {
				const customer = sessionWithCustomer.customer as Stripe.Customer;
				// add customer to user
				const userId = sessionWithCustomer.metadata.userId as string;
				if (userId !== '') {
					await db
						.update(users)
						.set({
							stripeCustomerId: customer.id
						})
						.where(eq(users.id, userId));
				}

				const id = await db
					.insert(orders)
					.values({
						stripeOrderId: sessionWithCustomer.id,
						stripeCustomerId: customer?.id,
						totalPrice: sessionWithCustomer.amount_total ?? 0,
						timestamp: new Date()
					})
					.returning({ id: orders.stripeOrderId });

				const codes = JSON.parse(sessionWithCustomer.metadata.codes) as {
					quantity: number;
					productId: string;
					code: string;
				}[];

				for (const code of codes) {
					await db.insert(orderProducts).values({
						orderId: id[0].id,
						quantity: code.quantity,
						productId: code.productId,
						customerName: customer?.name,
						customerEmail: customer.email ?? '',
						shippingAddress: customer.shipping?.address
					});
				}
			}
		}
	} catch (e) {
		console.log(e);
	}

	return new Response('OK', { status: 200 });
};
