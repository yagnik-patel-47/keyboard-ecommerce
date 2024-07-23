import { z } from 'zod';

export const formSchema = z.object({
	name: z.string().min(3).max(50),
	slug: z.string().min(3).max(50),
	description: z.string().optional(),
	categoryId: z.string().min(10)
});

export type FormSchema = typeof formSchema;
