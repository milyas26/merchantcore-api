import { StorePrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";

export class FrontstoreAuthRepository {
  constructor(private prisma: StorePrismaClient) {}

  async findAuthUserByEmail(email: string) {
    return await this.prisma.authUser.findUnique({
      where: { email },
      include: { customer: true },
    });
  }

  async updateLastLogin(id: string) {
    return await this.prisma.authUser.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  async createAuthUserAndCustomer(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
  }) {
    return await this.prisma.$transaction(async (tx) => {
      const auth = await tx.authUser.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash,
          status: "ACTIVE",
        },
      });

      const existingCustomer = await tx.customer.findUnique({
        where: { email: data.email },
      });

      const customer = existingCustomer
        ? await tx.customer.update({
            where: { id: existingCustomer.id },
            data: {
              firstName: data.firstName,
              lastName: data.lastName,
              authUserId: auth.id,
            },
          })
        : await tx.customer.create({
            data: {
              email: data.email,
              firstName: data.firstName,
              lastName: data.lastName,
              authUserId: auth.id,
            },
          });

      return { auth, customer };
    });
  }
}