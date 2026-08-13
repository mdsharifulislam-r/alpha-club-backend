import { z } from 'zod';

const createUserZodSchema = z.object({
  image: z.string({ required_error: 'Government issued certificate is required' }),
  name: z.string({ required_error: 'Name is required' }),
  profileImage: z.string().optional(),
  email: z.string({ required_error: 'Email is required' }),
  password: z.string({ required_error: 'Password is required' }),
  confirmPassword: z.string({ required_error: 'Confirm password is required' }),
  // Custom refinement to ensure password and confirmPassword match
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const updateUserZodSchema = z.object({
  name: z.string().optional(),
  profileImage: z.string().optional(),
  email: z.string().optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  status: z.enum(['active', 'block']).optional(),
  role: z.string().optional(),
  verified: z.boolean().optional(),
  authentication: z.object({
    isResetPassword: z.boolean().optional(),
    oneTimeCode: z.number().nullable().optional(),
    expireAt: z.date().nullable().optional(),
  }).optional(),
}).refine(
  (data) => {
    // Only check if either password or confirmPassword is present
    if (data.password || data.confirmPassword) {
      return data.password === data.confirmPassword;
    }
    return true;
  },
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }
);

export const UserValidation = {
  createUserZodSchema,
  updateUserZodSchema,
};