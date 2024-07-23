import { z } from 'zod';

export const status = {
	active: 'Active',
	draft: 'Draft',
	archived: 'Archived'
};

type Status = keyof typeof status;

const variant = z.object({
	id: z.string(),
	name: z.string().min(3),
	code: z.string().min(3),
	stock: z.coerce.number(),
	price: z.coerce.number(),
	isDefault: z.boolean(),
	stripeProductId: z.string().optional().nullable(),
	stripePriceId: z.string().optional().nullable()
});

const newVariants = variant.omit({ id: true, stripeProductId: true, stripePriceId: true });

export const createProductSchema = z.object({
	name: z.string().min(2).max(50),
	slug: z.string().min(8).max(50),
	specifications: z.string().optional().nullable(),
	description: z.string().optional().nullable(),
	addDetails: z.string().optional().nullable(),
	categoryId: z.string().min(16),
	subcategoryId: z.string().optional().nullable(),
	variants: z.array(newVariants)
});

export const updateProductSchema = z
	.object({
		name: z.string().min(2).max(50),
		slug: z.string().min(8).max(50),
		specifications: z.string().optional().nullable(),
		description: z.string().optional().nullable(),
		addDetails: z.string().optional().nullable(),
		categoryId: z.string().min(16),
		subcategoryId: z.string().optional().nullable(),
		variants: z.array(variant),
		newVariants: z.array(newVariants),
		status: z.enum(Object.keys(status) as [Status, ...Status[]]).default('draft')
	})
	.superRefine((val, ctx) => {
		let defaultCount = 0;

		const combinedVariants = [...val.variants, ...val.newVariants];

		combinedVariants.forEach((variant) => variant.isDefault && (defaultCount += 1));

		if (defaultCount === 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `1 variant should be default.`,
				path: [val.variants.length > 0 ? 'variants' : 'newVariants', 0, 'isDefault']
			});
		} else if (defaultCount > 1) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Only 1 variant can be default.`,
				path: [
					val.newVariants.length > 0 ? 'newVariants' : 'variants',
					combinedVariants.length - 1,
					'isDefault'
				]
			});
		}
	});
