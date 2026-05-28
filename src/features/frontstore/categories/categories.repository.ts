import { StorePrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";
import type { GetCategoriesQuery } from "./categories.schema";

export class FrontstoreCategoryRepository {
  constructor(private prisma: StorePrismaClient) {}

  async findAll(query: GetCategoriesQuery) {
    const { includeEmpty } = query;

    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { products: { where: { isActive: true } } } },
      },
    });

    const result = categories
      .filter((c) => includeEmpty || c._count.products > 0)
      .map(({ _count, ...rest }) => ({
        ...rest,
        productCount: _count.products,
      }));

    return { data: result };
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug, isActive: true },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            variants: { select: { id: true, price: true, compareAtPrice: true, inventory: { select: { quantity: true } } } },
            images: { select: { id: true, url: true, alt: true }, orderBy: { position: "asc" } },
          },
        },
      },
    });

    return category;
  }
}
