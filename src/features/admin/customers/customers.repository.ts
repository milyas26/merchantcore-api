/* eslint-disable @typescript-eslint/no-explicit-any */
import { StorePrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";
import { GetCustomersQuery } from "./customers.schema";

export class CustomersRepository {
  constructor(private prisma: StorePrismaClient) {}

  async findMany(query: GetCustomersQuery) {
    const {
      page = 1,
      limit = 20,
      q,
      acceptsMarketing,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (q) {
      where.OR = [
        { email: { contains: q, mode: "insensitive" } },
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
      ];
    }
    if (acceptsMarketing !== undefined) {
      where.acceptsMarketing = acceptsMarketing;
    }

    const total = await this.prisma.customer.count({ where });

    const customers = await this.prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        _count: { select: { orders: true, addresses: true } },
      },
    });

    return {
      data: customers,
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