import { z } from 'zod';
import { MembershipType } from './membershipApplication..constant';

const familyMemberSchema = z.object({
  name: z.string(),
  relation: z.string(),
});

const createZodSchema = z.object({
  body: z.object({
    logo: z.string().optional(),
    title: z.string({ required_error: 'Title is required' }),
    description: z.string().optional(),
    subDescription: z.string().optional(),
    membershipType: z.nativeEnum(MembershipType, {
      required_error: 'Membership type is required',
    }),
    features: z.array(z.string()).min(1, 'At least one feature is required'),
    familyMembers: z.array(familyMemberSchema).optional(),
    isActive: z.boolean().optional(),
  }),
});

const updateZodSchema = z.object({
  body: z.object({
    logo: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    subDescription: z.string().optional(),
    membershipType: z.nativeEnum(MembershipType).optional(),
    features: z.array(z.string()).optional(),
    familyMembers: z.array(familyMemberSchema).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const MemberShipPlanValidation = {
  createZodSchema,
  updateZodSchema,
};

