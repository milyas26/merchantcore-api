import { Prisma, PrismaClient } from "@prisma/client";
import { UserProfileResponse } from "./user.interface";

export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<UserProfileResponse | null> {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  async findByEmail(email: string): Promise<UserProfileResponse | null> {
    return await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  async findByEmailExcludeId(email: string, excludeId: string): Promise<UserProfileResponse | null> {
    return await this.prisma.user.findFirst({
      where: {
        email: email,
        NOT: { id: excludeId }
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<UserProfileResponse> {
    return await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  async findByIdWithPassword(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });
  }
}