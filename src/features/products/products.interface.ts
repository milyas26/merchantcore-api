import { Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: Decimal;
  categoryId: string;
  sku: string | null;
  compareAtPrice: Decimal | null;
  cost: Decimal | null;
  weight: Decimal | null;
  isActive: boolean;
  isFeatured: boolean;
  trackInventory: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
  variants?: ProductVariant[];
  images?: ProductMedia[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  title: string;
  sku: string;
  price: Decimal;
  compareAtPrice: Decimal | null;
  cost: Decimal | null;
  weight: Decimal | null;
  barcode: string | null;
  image: string | null;
  position: number;
  isActive: boolean;
  inventory?: {
    quantity: number;
    reserved: number;
    lowStockThreshold: number | null;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductMedia {
  id: string;
  productId: string;
  url: string;
  alt: string | null;
  position: number;
  createdAt: Date;
}

export type { GetProductsQuery } from "./products.schema";

export interface GetProductsResponse {
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ProductResponse {
  data: Product;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Prisma.PrismaClientKnownRequestError;
  };
}
