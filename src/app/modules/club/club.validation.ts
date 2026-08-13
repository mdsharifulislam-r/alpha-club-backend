import { z } from 'zod';

const createZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    image: z.string().optional(),
    location: z.string().optional(),
    description: z.string().optional(),
    limitOfMember: z.number().min(1).optional(),
    active: z.boolean().optional(),
  }),
});

const updateZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    image: z.string().optional(),
    location: z.string().optional(),
    description: z.string().optional(),
    limitOfMember: z.number().min(1).optional(),
    active: z.boolean().optional(),
  }),
});

export const ClubValidation = {
  createZodSchema,
  updateZodSchema,
};

