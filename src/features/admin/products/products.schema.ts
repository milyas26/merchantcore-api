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

// Create Product Schemas
export const createProductImageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
  position: z.number().int().nonnegative().optional().default(0),
});

export const createVariantOptionSchema = z.object({
  optionName: z.string().min(1).max(50),
  optionValue: z.string().min(1).max(100),
});

export const createProductVariantSchema = z.object({
  title: z.string().min(1).max(255),
  sku: z.string().min(1).max(100),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  cost: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  barcode: z.string().max(100).optional(),
  image: z.string().optional(),
  position: z.number().int().nonnegative().optional().default(0),
  isActive: z.boolean().optional().default(true),
  inventory: z
    .object({
      quantity: z.number().int().nonnegative(),
      reserved: z.number().int().nonnegative().optional().default(0),
      lowStockThreshold: z.number().int().positive().optional(),
    })
    .optional(),
  options: z.array(createVariantOptionSchema).optional(),
});

export const createProductAttributeSchema = z.object({
  name: z.string().min(1).max(100),
  value: z.string().min(1).max(500),
  position: z.number().int().nonnegative().optional().default(0),
});

export const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  categoryId: z.string().min(1),
  sku: z.string().max(100).optional().or(z.literal("")),
  basePrice: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  cost: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  barcode: z.string().max(100).optional(),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  trackInventory: z.boolean().optional().default(true),
  isVariant: z.boolean().optional().default(false),
  seoTitle: z.string().max(255).optional(),
  seoDescription: z.string().max(500).optional(),
  images: z.array(createProductImageSchema).optional(),
  variants: z.array(createProductVariantSchema).optional(),
  attributes: z.array(createProductAttributeSchema).optional(),
});

export type CreateProductRequest = z.infer<typeof createProductSchema>;
export type CreateProductImageRequest = z.infer<typeof createProductImageSchema>;
export type CreateProductVariantRequest = z.infer<typeof createProductVariantSchema>;
export type CreateVariantOptionRequest = z.infer<typeof createVariantOptionSchema>;
export type CreateProductAttributeRequest = z.infer<typeof createProductAttributeSchema>;

export const upsertProductSchema = createProductSchema.extend({
  id: z.union([z.string(), z.number().int().nonnegative()]).optional(),
});