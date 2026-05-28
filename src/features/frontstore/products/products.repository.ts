/* eslint-disable @typescript-eslint/no-explicit-any */
import type { GetProductsQuery } from "./products.schema";
import { StorePrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";

export class FrontstoreProductRepository {
  constructor(private prisma: StorePrismaClient) {}

  async findMany(query: GetProductsQuery) {
    const {
      page = 1,
      limit = 20,
      q,
      category,
      published = true,
      priceMin,
      priceMax,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;
    const where: any = { isActive: published };

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = { slug: category };
    }

    if (priceMin !== undefined || priceMax !== undefined) {
      where.basePrice = {
        ...(priceMin !== undefined && { gte: priceMin }),
        ...(priceMax !== undefined && { lte: priceMax }),
      };
    }

    const total = await this.prisma.product.count({ where });

    const products = await this.prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        name: true,
        slug: true,
        basePrice: true,
        compareAtPrice: true,
        isVariant: true,
        isActive: true,
        isFeatured: true,
        category: {
          select: { name: true, slug: true },
        },
        images: {
          select: { id: true, url: true, alt: true },
          take: 1,
          orderBy: { position: "asc" },
        },
        _count: {
          select: { variants: true },
        },
      },
    });

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async findBySlug(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        category: {
          select: { id: true, name: true, slug: true, description: true },
        },
        variants: {
          select: {
            id: true, title: true, sku: true, price: true, compareAtPrice: true,
            image: true, inventory: { select: { quantity: true, reserved: true } },
          },
        },
        images: {
          select: { id: true, url: true, alt: true, position: true },
          orderBy: { position: "asc" },
        },
        attributes: {
          select: { id: true, name: true, value: true },
          orderBy: { position: "asc" },
        },
        productReviews: {
          where: { isVisible: true, status: "APPROVED" },
          select: { id: true, rating: true, title: true, body: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
  }

  async findRelated(productId: string, categoryId: string, limit = 4) {
    return this.prisma.product.findMany({
      where: {
        id: { not: productId },
        categoryId,
        isActive: true,
      },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        variants: { select: { id: true, price: true, compareAtPrice: true, inventory: { select: { quantity: true } } } },
        images: { select: { id: true, url: true, alt: true }, orderBy: { position: "asc" } },
      },
    });
  }
}