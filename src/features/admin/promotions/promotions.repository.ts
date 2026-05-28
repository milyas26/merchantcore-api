import type { StorePrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";
import type { GetPromotionsQuery, CreatePromotionRequest, UpdatePromotionRequest } from "./promotions.schema";

export class PromotionRepository {
  constructor(private prisma: StorePrismaClient) {}

  async findMany(query: GetPromotionsQuery) {
    const {
      page = 1, limit = 20, q, type, active,
      sortBy = "createdAt", sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { couponCode: { contains: q, mode: "insensitive" } },
      ];
    }
    if (type) where.type = type;
    if (active !== undefined) where.isActive = active;

    const sortFieldMap: Record<string, string> = {
      title: "title",
      startsAt: "startsAt",
      endsAt: "endsAt",
      createdAt: "createdAt",
    };

    const total = await this.prisma.promotion.count({ where });

    const promotions = await this.prisma.promotion.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortFieldMap[sortBy] || "createdAt"]: sortOrder },
      include: {
        promotionProducts: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, basePrice: true, images: { select: { url: true, alt: true }, take: 1 } },
            },
          },
        },
        _count: { select: { promotionProducts: true, redemptions: true } },
      },
    });

    return {
      data: promotions,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async findById(id: string) {
    return this.prisma.promotion.findUnique({
      where: { id },
      include: {
        promotionProducts: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, basePrice: true, images: { select: { url: true, alt: true }, take: 1 } },
            },
          },
        },
        _count: { select: { promotionProducts: true, redemptions: true } },
      },
    });
  }

  async findByCouponCode(code: string) {
    return this.prisma.promotion.findUnique({ where: { couponCode: code } });
  }

  async create(data: CreatePromotionRequest) {
    return this.prisma.$transaction(async (tx) => {
      const promotion = await tx.promotion.create({
        data: {
          title: data.title,
          description: data.description || null,
          couponCode: data.couponCode || null,
          type: data.type,
          value: data.value || null,
          currency: data.currency || null,
          startsAt: data.startsAt ? new Date(data.startsAt) : null,
          endsAt: data.endsAt ? new Date(data.endsAt) : null,
          isActive: data.isActive ?? true,
          minSubtotal: data.minSubtotal || null,
          usageLimit: data.usageLimit || null,
          usageLimitPerCustomer: data.usageLimitPerCustomer || null,
        },
      });

      if (data.productIds && data.productIds.length > 0) {
        await tx.promotionProduct.createMany({
          data: data.productIds.map((productId) => ({
            promotionId: promotion.id,
            productId,
          })),
        });
      }

      return tx.promotion.findUnique({
        where: { id: promotion.id },
        include: {
          promotionProducts: {
            include: {
              product: {
                select: { id: true, name: true, slug: true, basePrice: true, images: { select: { url: true, alt: true }, take: 1 } },
              },
            },
          },
          _count: { select: { promotionProducts: true, redemptions: true } },
        },
      });
    });
  }

  async update(id: string, data: UpdatePromotionRequest) {
    return this.prisma.$transaction(async (tx) => {
      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.couponCode !== undefined) updateData.couponCode = data.couponCode;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.value !== undefined) updateData.value = data.value;
      if (data.currency !== undefined) updateData.currency = data.currency;
      if (data.startsAt !== undefined) updateData.startsAt = data.startsAt ? new Date(data.startsAt) : null;
      if (data.endsAt !== undefined) updateData.endsAt = data.endsAt ? new Date(data.endsAt) : null;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      if (data.minSubtotal !== undefined) updateData.minSubtotal = data.minSubtotal;
      if (data.usageLimit !== undefined) updateData.usageLimit = data.usageLimit;
      if (data.usageLimitPerCustomer !== undefined) updateData.usageLimitPerCustomer = data.usageLimitPerCustomer;

      await tx.promotion.update({ where: { id }, data: updateData });

      if (data.productIds !== undefined) {
        await tx.promotionProduct.deleteMany({ where: { promotionId: id } });
        if (data.productIds.length > 0) {
          await tx.promotionProduct.createMany({
            data: data.productIds.map((productId) => ({
              promotionId: id,
              productId,
            })),
          });
        }
      }

      return tx.promotion.findUnique({
        where: { id },
        include: {
          promotionProducts: {
            include: {
              product: {
                select: { id: true, name: true, slug: true, basePrice: true, images: { select: { url: true, alt: true }, take: 1 } },
              },
            },
          },
          _count: { select: { promotionProducts: true, redemptions: true } },
        },
      });
    });
  }

  async getPromotionProducts(promotionId: string) {
    return this.prisma.promotionProduct.findMany({
      where: { promotionId },
      include: {
        product: {
          select: {
            id: true, name: true, slug: true, basePrice: true, sku: true,
            images: { select: { url: true, alt: true }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async delete(id: string) {
    await this.prisma.promotion.delete({ where: { id } });
  }
}
