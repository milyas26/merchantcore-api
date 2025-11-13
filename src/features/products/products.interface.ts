// Product interfaces and types

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  categoryId: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
  variants?: ProductVariant[];
  media?: ProductMedia[];
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
  price: number;
  stock: number;
  reserved: number;
  weight?: number | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
}

export interface ProductMedia {
  id: string;
  productId: string;
  url: string;
  type: 'IMAGE' | 'VIDEO';
  alt: string | null;
  position: number;
  createdAt: Date;
}

// Request/Response interfaces
// GetProductsQuery is now defined in products.schema.ts using Zod
export type { GetProductsQuery } from './products.schema';

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

// Error response interface
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}