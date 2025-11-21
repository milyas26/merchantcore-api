import { z } from "zod";

export const getOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  q: z.string().trim().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "total"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type GetOrdersQuery = z.infer<typeof getOrdersQuerySchema>;