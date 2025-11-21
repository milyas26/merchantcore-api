import { z } from "zod";

export const createStoreSchema = z.object({
  name: z
    .string()
    .min(1, "Store name is required")
    .max(100, "Store name must be less than 100 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
});

export const updateStoreSchema = z.object({
  name: z
    .string()
    .min(1, "Store name is required")
    .max(100, "Store name must be less than 100 characters")
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  isActive: z.boolean().optional(),
});