import { z } from 'zod';
import { MembershipStatus, FamilyMemberRelation } from './membershipApplication..constant';

const familyMemberSchema = z.object({
  name: z.string({ required_error: 'Family member name is required' }),
  relation: z.nativeEnum(FamilyMemberRelation, {
    required_error: 'Family member relation is required',
  }),
});

const createZodSchema = z.object({
  body: z.object({
    membershipType: z.string({ required_error: 'Membership type is required' }),
    name: z.string({ required_error: 'Name is required' }),
    email: z.string().email({ message: 'Invalid email address' }),
    phone: z.string({ required_error: 'Phone is required' }),
    address: z.string({ required_error: 'Address is required' }),
    familyMembers: z.array(familyMemberSchema).optional(),
    membershipStatus: z.nativeEnum(MembershipStatus).optional(),
    expireId: z.coerce.date().optional(),
  }),
});

const updateZodSchema = z.object({
  body: z.object({
    membershipType: z.string().optional(),
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    familyMembers: z.array(familyMemberSchema).optional(),
    membershipStatus: z.nativeEnum(MembershipStatus).optional(),
    expireId: z.coerce.date().optional(),
  }),
});

export const MemberShipApplicationValidation = {
  createZodSchema,
  updateZodSchema,
};

