import { z } from "zod";

export const createStoreSchema = z.object({
  slug: z.string()
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug must be at most 50 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  name: z.string()
    .min(1, "Store name is required")
    .max(100, "Store name must be at most 100 characters"),
  description: z.string()
    .max(500, "Description must be at most 500 characters")
    .optional()
});

export const updateStoreSchema = z.object({
  name: z.string()
    .min(1, "Store name is required")
    .max(100, "Store name must be at most 100 characters")
    .optional(),
  description: z.string()
    .max(500, "Description must be at most 500 characters")
    .optional(),
  isActive: z.boolean().optional()
});

export const storeParamsSchema = z.object({
  storeId: z.string().cuid("Invalid store ID")
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
export type StoreParamsInput = z.infer<typeof storeParamsSchema>;