import { FrontstoreCategoryRepository } from "./categories.repository";
import { FrontstoreCategoryValidation } from "./categories.validation";
import type { GetCategoriesQuery } from "./categories.schema";
import { StorePrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";

export class FrontstoreCategoryService {
  private repo: FrontstoreCategoryRepository;

  constructor(prisma: StorePrismaClient) {
    this.repo = new FrontstoreCategoryRepository(prisma);
  }

  async getCategories(query: GetCategoriesQuery) {
    const validated = FrontstoreCategoryValidation.safeValidateQuery(query);
    return this.repo.findAll(validated);
  }

  async getCategoryBySlug(slug: string) {
    return this.repo.findBySlug(slug);
  }
}
