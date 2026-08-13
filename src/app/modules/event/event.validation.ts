import { z } from 'zod';

const createZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    title: z.string({ required_error: 'Title is required' }),
    image: z.string().optional(),
    location: z.string().optional(),
    description: z.string().optional(),
    eventDate: z.coerce.date().optional(),
    eventTime: z.string().optional(),
  }),
});

const updateZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    title: z.string().optional(),
    image: z.string().optional(),
    location: z.string().optional(),
    description: z.string().optional(),
    eventDate: z.coerce.date().optional(),
    eventTime: z.string().optional(),
  }),
});

export const EventValidation = {
  createZodSchema,
  updateZodSchema,
};

