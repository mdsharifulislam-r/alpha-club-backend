import { z } from 'zod';

const aboutZodSchema = z.object({
  body: z.object({
    description: z.string({ required_error: 'Description is required' }),
  }),
});

const privacyPolicyZodSchema = z.object({
  body: z.object({
    description: z.string({ required_error: 'Description is required' }),
  }),
});

const termsOfServicesZodSchema = z.object({
  body: z.object({
    description: z.string({ required_error: 'Description is required' }),
  }),
});

export const SettingsValidation = {
  aboutZodSchema,
  privacyPolicyZodSchema,
  termsOfServicesZodSchema,
};

