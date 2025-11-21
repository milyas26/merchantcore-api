import { Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export type { GetOrdersQuery } from "./orders.schema";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "PARTIALLY_PAID"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED"
  | "FAILED";

export type FulfillmentStatus = "UNFULFILLED" | "PARTIALLY_FULFILLED" | "FULFILLED";

export interface OrderListItem {
  id: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  currency: string;
  subtotal: Decimal;
  tax: Decimal;
  shipping: Decimal;
  discount: Decimal;
  total: Decimal;
  notes?: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  customer: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  address1: string;
  address2?: string | null;
  city: string;
  province: string;
  country: string;
  postalCode: string;
}

export interface OrderItemDetail {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  price: Decimal;
  total: Decimal;
  product?: {
    id: string;
    slug: string;
    name: string;
  };
  variant?: {
    id: string;
    title: string;
    sku: string;
  } | null;
}

export interface OrderDetail extends OrderListItem {
  billingAddress: Address;
  shippingAddress: Address;
  items: OrderItemDetail[];
  transactions: any[];
  fulfillments: any[];
}

export interface GetOrdersResponse {
  data: OrderListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface OrderResponse {
  data: OrderDetail;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Prisma.PrismaClientKnownRequestError;
  };
}