import { z } from 'zod';

const createZodSchema = z.object({
  body: z.object({
    logo: z.string().optional(),
    title: z.string({ required_error: 'Title is required' }),
    location: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
  }),
});

const updateZodSchema = z.object({
  body: z.object({
    logo: z.string().optional(),
    title: z.string().optional(),
    location: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
  }),
});

export const SponsorValidation = {
  createZodSchema,
  updateZodSchema,
};

