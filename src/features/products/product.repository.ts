/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetProductsQuery } from "./products.interface";
import { PrismaClient } from '@prisma/client';

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
    const where: any = {
      isActive: published,
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
            compareAtPrice: true,
            cost: true,
            weight: true,
            image: true,
            position: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
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
            compareAtPrice: true,
            cost: true,
            weight: true,
            image: true,
            position: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
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
          orderBy: {
            position: "asc",
          },
        },
      },
    });
  }

  async checkStock(variantId: string, quantity: number) {
    const inventory = await this.prisma.inventory.findUnique({
      where: { variantId: variantId },
      select: {
        id: true,
        quantity: true,
        reserved: true,
      },
    });

    if (!inventory) {
      return { available: false, message: "Inventory not found for variant" };
    }

    const availableStock = inventory.quantity - inventory.reserved;

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
    return await this.prisma.inventory.update({
      where: { variantId: variantId },
      data: {
        reserved: {
          increment: quantity,
        },
      },
    });
  }

  async releaseStock(variantId: string, quantity: number) {
    return await this.prisma.inventory.update({
      where: { variantId: variantId },
      data: {
        reserved: {
          decrement: quantity,
        },
      },
    });
  }

  async finalizeStock(variantId: string, quantity: number) {
    return await this.prisma.$transaction(async (tx) => {
      // Decrease quantity and reserved in inventory
      const inventory = await tx.inventory.update({
        where: { variantId: variantId },
        data: {
          quantity: {
            decrement: quantity,
          },
          reserved: {
            decrement: quantity,
          },
        },
      });

      return inventory;
    });
  }
}
