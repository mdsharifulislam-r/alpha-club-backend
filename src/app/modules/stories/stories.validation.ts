import { z } from 'zod';

const createZodSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }),
    description: z.string().optional(),
    image: z.string().optional(),
    club: z.string().optional(),
  }),
});

const updateZodSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    club: z.string().optional(),
  }),
});

export const StoryValidation = {
  createZodSchema,
  updateZodSchema,
};


