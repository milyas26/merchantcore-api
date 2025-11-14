import { PublicPrismaClient } from "../../../packages/libs/db/getPrismaForSchema";

export class AuthRepository {
  constructor(private prisma: PublicPrismaClient) {}

  async findUserByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(data: { email: string; password: string; name?: string }) {
    return await this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name || null,
      },
    });
  }

  async findRefreshTokenByToken(token: string) {
    return await this.prisma.refreshToken.findFirst({
      where: {
        token: token,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });
  }

  async createRefreshToken(data: {
    token: string;
    userId: string;
    expiresAt: Date;
  }) {
    return await this.prisma.refreshToken.create({
      data: {
        token: data.token,
        userId: data.userId,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findRefreshTokenWithUser(token: string) {
    return await this.prisma.refreshToken.findFirst({
      where: {
        token: token,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });
  }

  async deleteRefreshToken(token: string) {
    return await this.prisma.refreshToken.deleteMany({
      where: {
        token: token,
      },
    });
  }

  async deleteRefreshTokensByUserId(userId: string) {
    return await this.prisma.refreshToken.deleteMany({
      where: {
        userId: userId,
      },
    });
  }

  async findStoresByUserId(userId: string) {
    return await this.prisma.storeMembership.findMany({
      where: {
        userId,
      },
      include: {
        store: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }
}