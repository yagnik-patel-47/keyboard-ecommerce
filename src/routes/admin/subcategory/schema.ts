import { z } from 'zod';

export const updateSubcategorySchema = z
	.object({
		name: z.string(),
		slug: z.string(),
		description: z.string().nullable(),
		categoryId: z.string()
	})
	.partial();
