import { z } from 'zod';

const createZodSchema = z.object({
  body: z.object({
    icon: z.string({ required_error: 'Icon is required' }),
    title: z.string({ required_error: 'Title is required' }),
    description: z.string({ required_error: 'Description is required' }),
    isActive: z.boolean().optional(),
  }),
});

const updateZodSchema = z.object({
  body: z.object({
    icon: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const MemberShipFeatureValidation = {
  createZodSchema,
  updateZodSchema,
};

