import { StorePrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";

export class FrontstoreAuthUserRepository {
  constructor(private prisma: StorePrismaClient) {}

  async findByAuthUserId(authUserId: string) {
    return this.prisma.customer.findFirst({
      where: { authUserId },
      include: {
        addresses: { orderBy: { isDefault: "desc" } },
        orders: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            items: {
              include: {
                product: {
                  select: { id: true, name: true, slug: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async updateProfile(authUserId: string, data: { firstName?: string; lastName?: string; phone?: string }) {
    const customer = await this.prisma.customer.findFirst({ where: { authUserId } });
    if (!customer) return null;

    return this.prisma.customer.update({
      where: { id: customer.id },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.phone !== undefined && { phone: data.phone }),
      },
      include: { addresses: true },
    });
  }

  async addAddress(authUserId: string, address: {
    firstName: string; lastName: string; phone: string;
    address1: string; address2?: string; city: string;
    province: string; country: string; postalCode: string;
    isDefault?: boolean;
  }) {
    const customer = await this.prisma.customer.findFirst({ where: { authUserId } });
    if (!customer) return null;

    if (address.isDefault) {
      await this.prisma.customerAddress.updateMany({
        where: { customerId: customer.id },
        data: { isDefault: false },
      });
    }

    return this.prisma.customerAddress.create({
      data: { ...address, customerId: customer.id },
    });
  }
}
