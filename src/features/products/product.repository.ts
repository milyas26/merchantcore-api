import { Prisma, PrismaClient } from "@prisma/client";
import { GetProductsQuery } from "./products.interface";

export class ProductRepository {
  constructor(private prisma: PrismaClient) {}

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

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      published,
    };

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = {
        slug: category,
      };
    }

    // Get total count
    const total = await this.prisma.product.count({ where });

    // Get products with relations
    const products = await this.prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
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
            stock: true,
            reserved: true,
            weight: true,
            length: true,
            width: true,
            height: true,
          },
        },
        media: {
          select: {
            id: true,
            productId: true,
            url: true,
            type: true,
            alt: true,
            position: true,
            createdAt: true,
          },
          orderBy: {
            position: "asc",
          },
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

  async findById(id: string) {
    return await this.prisma.product.findUnique({
      where: { id },
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
            stock: true,
            reserved: true,
            weight: true,
            length: true,
            width: true,
            height: true,
          },
        },
        media: {
          select: {
            id: true,
            productId: true,
            url: true,
            type: true,
            alt: true,
            position: true,
            createdAt: true,
          },
          orderBy: {
            position: "asc",
          },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    return await this.prisma.product.findUnique({
      where: { slug },
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
            stock: true,
            reserved: true,
            weight: true,
            length: true,
            width: true,
            height: true,
          },
        },
        media: {
          select: {
            id: true,
            url: true,
            type: true,
            alt: true,
            position: true,
            createdAt: true,
          },
          orderBy: {
            position: "asc",
          },
        },
      },
    });
  }

  async checkStock(variantId: string, quantity: number) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      select: {
        id: true,
        stock: true,
        reserved: true,
      },
    });

    if (!variant) {
      return { available: false, message: "Variant not found" };
    }

    const availableStock = variant.stock - variant.reserved;

    if (availableStock < quantity) {
      return {
        available: false,
        message: `Insufficient stock. Available: ${availableStock}, Requested: ${quantity}`,
        availableStock,
        requestedQuantity: quantity,
      };
    }

    return {
      available: true,
      availableStock,
      requestedQuantity: quantity,
    };
  }

  async reserveStock(variantId: string, quantity: number) {
    return await this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        reserved: {
          increment: quantity,
        },
      },
    });
  }

  async releaseStock(variantId: string, quantity: number) {
    return await this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        reserved: {
          decrement: quantity,
        },
      },
    });
  }

  async finalizeStock(variantId: string, quantity: number) {
    return await this.prisma.$transaction(async (tx) => {
      // Decrease stock and reserved
      const variant = await tx.productVariant.update({
        where: { id: variantId },
        data: {
          stock: {
            decrement: quantity,
          },
          reserved: {
            decrement: quantity,
          },
        },
      });

      return variant;
    });
  }
}
