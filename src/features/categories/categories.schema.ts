// Category validation schemas using Zod
import { z } from 'zod';

export const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  description: z.string().nullable(),
  image: z.string().url().nullable(),
  parentId: z.string().uuid().nullable(),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const getCategoriesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  q: z.string().trim().optional(),
  parentId: z.string().uuid().optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z
    .enum(["name", "sortOrder", "createdAt", "updatedAt"])
    .optional()
    .default("sortOrder"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});

export const getCategoryByIdSchema = z.object({
  id: z.string().uuid(),
});

export const getCategoryBySlugSchema = z.object({
  slug: z.string().min(1),
});

export const categoryResponseSchema = z.object({
  data: categorySchema.extend({
    parent: categorySchema.optional(),
    children: z.array(categorySchema).optional(),
  }),
});

export const categoriesResponseSchema = z.object({
  data: z.array(categorySchema.extend({
    parent: categorySchema.optional(),
    children: z.array(categorySchema).optional(),
  })),
  pagination: z.object({
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});

// Type inference
export type GetCategoriesQuery = z.infer<typeof getCategoriesQuerySchema>;
export type GetCategoryByIdParams = z.infer<typeof getCategoryByIdSchema>;
export type GetCategoryBySlugParams = z.infer<typeof getCategoryBySlugSchema>;

// Create Category Schemas
export const createCategorySchema = z.object({
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
});

export type CreateCategoryRequest = z.infer<typeof createCategorySchema>;