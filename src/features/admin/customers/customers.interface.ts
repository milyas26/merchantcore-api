import { Prisma } from "@prisma/client";

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  acceptsMarketing: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    orders: number;
    addresses: number;
  };
}

export interface GetCustomersResponse {
  data: Customer[];
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
    details?: Prisma.PrismaClientKnownRequestError;
  };
}

export type { GetCustomersQuery } from "./customers.schema";