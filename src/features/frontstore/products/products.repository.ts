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

    const total = await this.prisma.product.count({ where });

    const products = await this.prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        variants: {
          select: {
            id: true,
            productId: true,
            title: true,
            sku: true,
            price: true,
            compareAtPrice: true,
            cost: true,
            weight: true,
            barcode: true,
            image: true,
            position: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            inventory: {
              select: {
                quantity: true,
                reserved: true,
                lowStockThreshold: true,
              },
            },
          },
        },
        images: {
          select: {
            id: true,
            productId: true,
            url: true,
            alt: true,
            position: true,
            createdAt: true,
          },
          orderBy: { position: "asc" },
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
}