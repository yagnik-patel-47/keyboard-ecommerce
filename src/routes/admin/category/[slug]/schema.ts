import { z } from 'zod';

export const schema = z.object({
	name: z.string(),
	slug: z.string()
});
