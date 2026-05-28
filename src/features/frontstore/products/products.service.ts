import { FrontstoreProductRepository } from "./products.repository";
import { FrontstoreProductValidation } from "./products.validation";
import type { GetProductsQuery } from "./products.schema";
import { StorePrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";

export class FrontstoreProductService {
  private productRepository: FrontstoreProductRepository;

  constructor(prisma: StorePrismaClient) {
    this.productRepository = new FrontstoreProductRepository(prisma);
  }

  async getProducts(query: GetProductsQuery) {
    const base = FrontstoreProductValidation.safeValidateQuery(query);
    const validated = { ...base, published: true };
    const result = await this.productRepository.findMany(validated);
    const featuredParam = (query as any)?.featured;
    if (featuredParam !== undefined && featuredParam !== null) {
      const featured =
        typeof featuredParam === "string"
          ? featuredParam === "true"
          : !!featuredParam;
      const filtered = (result.data as any[]).filter(
        (p: any) => p.isFeatured === featured
      );
      const total = filtered.length;
      const totalPages = Math.ceil(total / result.pagination.limit);
      const hasNext = result.pagination.page < totalPages;
      const hasPrev = result.pagination.page > 1;
      return {
        data: filtered,
        pagination: {
          ...result.pagination,
          total,
          totalPages,
          hasNext,
          hasPrev,
        },
      };
    }
    return result;
  }

  async getProductBySlug(slug: string) {
    return this.productRepository.findBySlug(slug);
  }
}