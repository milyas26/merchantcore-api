import { z } from "zod";

export type InventoryStatus = "low" | "normal" | "out";

export interface InventoryItem {
  id: string;
  productId: string;
  productSlug?: string;
  name: string;
  sku: string;
  categoryId?: string;
  categoryName?: string;
  quantity: number;
  reserved: number;
  lowStockThreshold?: number | null;
  status: InventoryStatus;
  updatedAt: Date;
}

export interface GetInventoriesResponse {
  data: InventoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export const getInventoriesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  q: z.string().trim().optional(),
  category: z.string().trim().optional(),
  status: z.enum(["low", "normal", "out"]).optional(),
  sortBy: z
    .enum(["name", "sku", "quantity", "reserved", "updatedAt"]) 
    .optional()
    .default("updatedAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type GetInventoriesQuery = z.infer<typeof getInventoriesQuerySchema>;

export const updateInventorySchema = z.object({
  quantity: z.number().int().nonnegative(),
  reserved: z.number().int().nonnegative(),
});
export type UpdateInventoryBody = z.infer<typeof updateInventorySchema>;