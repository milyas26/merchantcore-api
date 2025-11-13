import { Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: Decimal;
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
  price: Decimal;
  stock: number;
  reserved: number;
  weight?: Decimal | null;
  length?: Decimal | null;
  width?: Decimal | null;
  height?: Decimal | null;
}

export interface ProductMedia {
  id: string;
  productId: string;
  url: string;
  type: "IMAGE" | "VIDEO";
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
