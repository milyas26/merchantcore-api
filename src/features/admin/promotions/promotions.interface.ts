export interface PromotionProductWithProduct {
  id: string;
  promotionId: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    images: { url: string; alt: string | null }[];
  };
}

export interface PromotionWithRelations {
  id: string;
  title: string;
  description: string | null;
  couponCode: string | null;
  type: string;
  value: number | null;
  currency: string | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  minSubtotal: number | null;
  usageLimit: number | null;
  usageLimitPerCustomer: number | null;
  createdAt: string;
  updatedAt: string;
  promotionProducts: PromotionProductWithProduct[];
  _count?: {
    promotionProducts: number;
    redemptions: number;
  };
}

export interface GetPromotionsResponse {
  data: PromotionWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PromotionResponse {
  data: PromotionWithRelations;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
