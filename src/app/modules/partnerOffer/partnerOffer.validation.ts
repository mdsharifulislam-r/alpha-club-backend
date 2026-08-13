import { z } from 'zod';

const createZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    title: z.string({ required_error: 'Title is required' }),
    image: z.string().optional(),
    description: z.string().optional(),
    location: z.string().optional(),
    buttonText: z.string().optional(),
    colorCard: z.string().optional(),
  }),
});

const updateZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    title: z.string().optional(),
    image: z.string().optional(),
    description: z.string().optional(),
    location: z.string().optional(),
    buttonText: z.string().optional(),
    colorCard: z.string().optional(),
  }),
});

export const PartnerOfferValidation = {
  createZodSchema,
  updateZodSchema,
};

