import { z } from "zod";

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).trim().optional(),
  lastName: z.string().min(1).max(100).trim().optional(),
  phone: z.string().max(20).optional(),
});

export const addAddressSchema = z.object({
  firstName: z.string().min(1).max(100).trim(),
  lastName: z.string().min(1).max(100).trim(),
  phone: z.string().min(1).max(20),
  address1: z.string().min(1).max(255).trim(),
  address2: z.string().max(255).trim().optional(),
  city: z.string().min(1).max(100).trim(),
  province: z.string().max(100).trim(),
  country: z.string().max(100).trim().default("Sweden"),
  postalCode: z.string().min(1).max(20).trim(),
  isDefault: z.boolean().optional().default(false),
});

export type UpdateProfileBody = z.infer<typeof updateProfileSchema>;
export type AddAddressBody = z.infer<typeof addAddressSchema>;
