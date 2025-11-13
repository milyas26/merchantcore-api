// Product validation schemas using Zod
import { z } from 'zod';
import { Decimal } from "@prisma/client/runtime/library";

const decimalSchema = z.custom<Decimal>((val) => {
  return val instanceof Decimal || typeof val === "object";
});

export const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  description: z.string().nullable(),
  price: decimalSchema,
  categoryId: z.string().uuid(),
  published: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  description: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const productVariantSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  title: z.string().min(1).max(255),
  sku: z.string().min(1).max(100),
  price: decimalSchema,
  stock: z.number().int().nonnegative(),
  reserved: z.number().int().nonnegative(),
  weight: decimalSchema.nullable().optional(),
  length: decimalSchema.nullable().optional(),
  width: decimalSchema.nullable().optional(),
  height: decimalSchema.nullable().optional(),
});

export const productMediaSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  url: z.string().url(),
  type: z.enum(["IMAGE", "VIDEO"]),
  alt: z.string().nullable(),
  position: z.number().int().nonnegative(),
  createdAt: z.date(),
});

export const getProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  q: z.string().trim().optional(),
  category: z.string().trim().optional(),
  published: z.coerce.boolean().optional().default(true),
  sortBy: z
    .enum(["name", "price", "createdAt", "updatedAt"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const getProductByIdSchema = z.object({
  id: z.string().uuid(),
});

export const getProductBySlugSchema = z.object({
  slug: z.string().min(1),
});

export const checkStockSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1),
});

export const productResponseSchema = z.object({
  data: productSchema.extend({
    category: categorySchema.optional(),
    variants: z.array(productVariantSchema).optional(),
    media: z.array(productMediaSchema).optional(),
  }),
});

export const productsResponseSchema = z.object({
  data: z.array(productSchema.extend({
    category: categorySchema.optional(),
    variants: z.array(productVariantSchema).optional(),
    media: z.array(productMediaSchema).optional(),
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

export const stockResponseSchema = z.object({
  available: z.boolean(),
  message: z.string().optional(),
  availableStock: z.number().int().nonnegative().optional(),
  requestedQuantity: z.number().int().positive().optional(),
});

// Type inference
export type GetProductsQuery = z.infer<typeof getProductsQuerySchema>;
export type GetProductByIdParams = z.infer<typeof getProductByIdSchema>;
export type GetProductBySlugParams = z.infer<typeof getProductBySlugSchema>;
export type CheckStockBody = z.infer<typeof checkStockSchema>;