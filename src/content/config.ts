import { defineCollection, z } from 'astro:content';

const postsCollection = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		publishedDate: z.date().optional(),
		updatedDate: z.date().optional(),
		status: z.enum(['seed', 'sprout', 'tree']),
		draft: z.boolean().optional(),
		tags: z.array(z.string()),
		summary: z.string(),
	}),
});

export const collections = {
	'posts': postsCollection,
};
