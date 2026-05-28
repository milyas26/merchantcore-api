import { z } from "zod";

export const getProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  q: z.string().trim().optional(),
  category: z.string().trim().optional(),
  published: z.coerce.boolean().optional().default(true),
  featured: z.coerce.boolean().optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  sortBy: z
    .enum(["name", "price", "createdAt", "updatedAt"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type GetProductsQuery = z.infer<typeof getProductsQuerySchema>;