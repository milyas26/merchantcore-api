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

// Create Product Interfaces
export interface CreateProductRequest {
  name: string;
  slug: string;
  description?: string;
  categoryId: string;
  sku?: string;
  basePrice: number;
  compareAtPrice?: number;
  cost?: number;
  weight?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  trackInventory?: boolean;
  isVariant?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  images?: CreateProductImageRequest[];
  variants?: CreateProductVariantRequest[];
  attributes?: CreateProductAttributeRequest[];
}

export interface CreateProductImageRequest {
  url: string;
  alt?: string;
  position?: number;
}

export interface CreateProductVariantRequest {
  title: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  weight?: number;
  barcode?: string;
  image?: string;
  position?: number;
  isActive?: boolean;
  inventory?: {
    quantity: number;
    reserved?: number;
    lowStockThreshold?: number;
  };
  options?: CreateVariantOptionRequest[];
}

export interface CreateVariantOptionRequest {
  optionName: string;
  optionValue: string;
}

export interface CreateProductAttributeRequest {
  name: string;
  value: string;
  position?: number;
}

export interface CreateProductResponse {
  data: Product;
}

export interface UpsertProductRequest extends CreateProductRequest {
  id?: string | number;
}
