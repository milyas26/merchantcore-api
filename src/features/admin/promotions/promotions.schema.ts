import { z } from "zod";

export const getPromotionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  q: z.string().trim().optional(),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"]).optional(),
  active: z.coerce.boolean().optional(),
  sortBy: z.enum(["title", "startsAt", "endsAt", "createdAt"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const createPromotionProductSchema = z.object({
  productId: z.string().min(1),
});

export const createPromotionSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  couponCode: z.string().max(100).optional(),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"]),
  value: z.number().positive().optional(),
  currency: z.string().max(10).optional(),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
  isActive: z.boolean().optional().default(true),
  minSubtotal: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  usageLimitPerCustomer: z.number().int().positive().optional(),
  productIds: z.array(z.string()).optional(),
});

export const updatePromotionSchema = createPromotionSchema.partial();

export type GetPromotionsQuery = z.infer<typeof getPromotionsQuerySchema>;
export type CreatePromotionRequest = z.infer<typeof createPromotionSchema>;
export type UpdatePromotionRequest = z.infer<typeof updatePromotionSchema>;
