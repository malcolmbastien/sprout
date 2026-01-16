import { defineCollection, z } from 'astro:content';

const notesCollection = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		publishedDate: z.date().optional(),
		updatedDate: z.date().optional(),
		stage: z.enum(['seed', 'sprout', 'evergreen']),
		draft: z.boolean().optional(),
		tags: z.array(z.string()),
		summary: z.string(),
	}),
});

export const collections = {
	'notes': notesCollection,
};
