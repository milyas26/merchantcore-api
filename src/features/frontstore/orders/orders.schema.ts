import { z } from "zod";

export const createOrderSchema = z.object({
  shippingAddressId: z.string().min(1),
  billingAddressId: z.string().min(1),
  shippingMethodId: z.string().min(1).optional(),
  notes: z.string().max(500).optional(),
  discountCode: z.string().optional(),
});

export type CreateOrderBody = z.infer<typeof createOrderSchema>;
