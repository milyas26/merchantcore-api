import { StorePrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";
import { GetOrdersQuery } from "./orders.schema";

export class OrdersRepository {
  constructor(private prisma: StorePrismaClient) {}

  async findMany(query: GetOrdersQuery) {
    const { page = 1, limit = 20, q, sortBy = "createdAt", sortOrder = "desc" } = query;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (q) {
      where.OR = [
        { id: { contains: q } },
        { customer: { email: { contains: q, mode: "insensitive" } } },
        { customer: { firstName: { contains: q, mode: "insensitive" } } },
        { customer: { lastName: { contains: q, mode: "insensitive" } } },
      ];
    }

    const total = await this.prisma.order.count({ where });

    const orders = await this.prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      data: orders,
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
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        billingAddress: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            address1: true,
            address2: true,
            city: true,
            province: true,
            country: true,
            postalCode: true,
          },
        },
        shippingAddress: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            address1: true,
            address2: true,
            city: true,
            province: true,
            country: true,
            postalCode: true,
          },
        },
        transactions: true,
        fulfillments: true,
        events: true,
        promotionRedemptions: true,
      },
    });

    if (!order) return null;

    const items = await this.prisma.orderItem.findMany({
      where: { orderId: id },
      include: {
        product: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
        variant: {
          select: {
            id: true,
            title: true,
            sku: true,
          },
        },
      },
    });

    return { ...order, items };
  }
}