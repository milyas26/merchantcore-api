import { z } from "zod";

export const customerSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().min(1).max(255),
  lastName: z.string().min(1).max(255),
  phone: z.string().nullable().optional(),
  acceptsMarketing: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const getCustomersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  q: z.string().trim().optional(),
  acceptsMarketing: z.coerce.boolean().optional(),
  sortBy: z
    .enum(["firstName", "lastName", "email", "createdAt", "updatedAt"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const customersResponseSchema = z.object({
  data: z.array(
    customerSchema.extend({
      _count: z
        .object({ orders: z.number().int(), addresses: z.number().int() })
        .optional(),
    })
  ),
  pagination: z.object({
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});

export type GetCustomersQuery = z.infer<typeof getCustomersQuerySchema>;