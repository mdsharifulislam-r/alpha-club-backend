import { z } from 'zod';

const createZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    title: z.string({ required_error: 'Title is required' }),
    location: z.string().optional(),
    image: z.string().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
  }),
});

const updateZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    title: z.string().optional(),
    location: z.string().optional(),
    image: z.string().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
  }),
});

export const ExclusiveOfferValidation = {
  createZodSchema,
  updateZodSchema,
};

