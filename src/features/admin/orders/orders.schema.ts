import { z } from "zod";

export const getOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  q: z.string().trim().optional(),
  sortBy: z
    .enum(["createdAt", "updatedAt", "total"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
});

export const updatePaymentStatusSchema = z.object({
  paymentStatus: z.enum(["PENDING", "PAID", "PARTIALLY_PAID", "REFUNDED", "PARTIALLY_REFUNDED", "FAILED"]),
});

export type GetOrdersQuery = z.infer<typeof getOrdersQuerySchema>;
export type UpdateOrderStatusBody = z.infer<typeof updateOrderStatusSchema>;
export type UpdatePaymentStatusBody = z.infer<typeof updatePaymentStatusSchema>;