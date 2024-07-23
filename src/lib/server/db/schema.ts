import {
	pgTable,
	text,
	timestamp,
	pgEnum,
	primaryKey,
	integer,
	boolean,
	varchar,
	index,
	json,
	doublePrecision
} from 'drizzle-orm/pg-core';
import { createId } from './utils';
import { relations } from 'drizzle-orm';
import type Stripe from 'stripe';

export const providerEnum = pgEnum('provider', ['github']);
export const productStatusEnum = pgEnum('status', ['draft', 'active', 'archived']);
export const imageAspectEnum = pgEnum('aspect', ['square', 'vertical', 'horizontal']);

export const users = pgTable(
	'user',
	{
		id: text('id').notNull().unique(),
		provider: providerEnum('provider').notNull(),
		providerId: text('provider_id').notNull(),
		name: text('name'),
		email: text('email').notNull(),
		stripeCustomerId: text('stripe_customer_id').unique(),
		isAdmin: boolean('is_admin').default(false)
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.provider, table.providerId] })
		};
	}
);

export const sessions = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	expiresAt: timestamp('expires_at', {
		withTimezone: true,
		mode: 'date'
	}).notNull()
});

export const categories = pgTable('categories', {
	id: varchar('id', { length: 30 })
		.$defaultFn(() => createId())
		.primaryKey(),
	name: varchar('name', { length: 256 }).notNull().unique(),
	slug: varchar('slug', { length: 256 }).unique().notNull(),
	description: text('description')
});

export const subcategories = pgTable(
	'subcategories',
	{
		id: varchar('id', { length: 30 })
			.$defaultFn(() => createId())
			.primaryKey(),
		name: varchar('name', { length: 256 }).notNull().unique(),
		slug: varchar('slug', { length: 256 }).unique().notNull(),
		description: text('description'),
		categoryId: varchar('category_id', { length: 30 })
			.references(() => categories.id, { onDelete: 'cascade' })
			.notNull()
	},
	(table) => ({
		subcategoriesCategoryIdIdx: index('subcategories_category_id_idx').on(table.categoryId)
	})
);

export const products = pgTable('products', {
	id: varchar('id', { length: 30 })
		.$defaultFn(() => createId())
		.primaryKey(),
	name: text('name').notNull(),
	slug: varchar('slug', { length: 256 }).unique().notNull(),
	description: text('description'),
	specifications: text('specifications'),
	addDetails: text('additional_details'),
	status: productStatusEnum('status').default('draft'),
	categoryId: varchar('category_id', { length: 30 }).references(() => categories.id, {
		onDelete: 'set null'
	}),
	subcategoryId: varchar('subcategory_id', { length: 30 }).references(() => subcategories.id, {
		onDelete: 'set null'
	}),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

export const productVariants = pgTable('product_variants', {
	id: varchar('id', { length: 30 })
		.$defaultFn(() => createId())
		.primaryKey(),
	productId: varchar('product_id', { length: 30 })
		.notNull()
		.references(() => products.id, { onDelete: 'cascade' }),
	name: varchar('name', { length: 255 }).notNull(),
	code: varchar('code', { length: 16 }).unique().notNull(),
	isDefault: boolean('is_default').notNull().default(false),
	price: doublePrecision('price').notNull(),
	stock: integer('stock').notNull(),
	stripeProductId: varchar('stripe_product_id', { length: 30 }),
	stripePriceId: varchar('stripe_price_id', { length: 30 }),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

export const productImages = pgTable('product_images', {
	cloudinaryId: text('cloudinary_id').primaryKey(),
	productId: varchar('product_id', { length: 30 }).references(() => products.id, {
		onDelete: 'cascade'
	}),
	aspect: imageAspectEnum('aspect').default('square'),
	isPrimary: boolean('is_primary').default(false).notNull()
});

export const orders = pgTable('orders', {
	stripeOrderId: varchar('stripe_order_id', { length: 100 }).primaryKey(),
	stripeCustomerId: varchar('stripe_customer_id', { length: 100 }),
	totalPrice: integer('total_price').notNull(),
	timestamp: timestamp('timestamp').notNull()
});

export const orderProducts = pgTable('order_product', {
	id: varchar('id', { length: 30 })
		.$defaultFn(() => createId())
		.primaryKey(),
	productId: varchar('product_id', { length: 100 })
		.references(() => productVariants.id, { onDelete: 'set null' })
		.notNull(),
	quantity: integer('quantity').notNull(),
	orderId: varchar('order_id', { length: 100 })
		.references(() => orders.stripeOrderId, { onDelete: 'cascade' })
		.notNull(),
	customerName: varchar('customer_name', { length: 50 }),
	customerEmail: varchar('customer_email', { length: 50 }).notNull(),
	shippingAddress: json('shipping_address').$type<Stripe.Customer.Shipping['address']>().default({
		city: null,
		country: null,
		line1: null,
		line2: null,
		postal_code: null,
		state: null
	})
});

// Relations
export const productRelations = relations(products, ({ one, many }) => ({
	category: one(categories, {
		fields: [products.categoryId],
		references: [categories.id]
	}),
	subcategory: one(subcategories, {
		fields: [products.subcategoryId],
		references: [subcategories.id]
	}),
	images: many(productImages),
	variants: many(productVariants)
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
	rootProduct: one(products, {
		fields: [productVariants.productId],
		references: [products.id]
	}),
	ordersProducts: many(orderProducts)
}));

export const imagesRelations = relations(productImages, ({ one }) => ({
	product: one(products, {
		fields: [productImages.productId],
		references: [products.id]
	})
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
	products: many(products),
	subcategories: many(subcategories)
}));

export const subCategoriesRelations = relations(subcategories, ({ one, many }) => ({
	products: many(products),
	category: one(categories, {
		fields: [subcategories.categoryId],
		references: [categories.id]
	})
}));

export const orderRelations = relations(orders, ({ many }) => ({
	products: many(orderProducts)
}));

export const orderProductRelations = relations(orderProducts, ({ one }) => ({
	order: one(orders, {
		fields: [orderProducts.orderId],
		references: [orders.stripeOrderId]
	}),
	product: one(productVariants, {
		fields: [orderProducts.productId],
		references: [productVariants.id]
	})
}));

export type NewProduct = typeof products.$inferInsert;
export type NewProductVariant = typeof productVariants.$inferInsert;
export type Product = typeof products.$inferSelect;
export type ProductVariant = typeof productVariants.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Subcategory = typeof subcategories.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;
