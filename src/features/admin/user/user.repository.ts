import { PublicPrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";
import { UserProfileResponse } from "./user.interface";

export class UserRepository {
  constructor(private prisma: PublicPrismaClient) {}

  async findById(id: string): Promise<UserProfileResponse | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!user) return null;
    
    return {
      ...user,
      name: user.name || "",
      role: "USER" // Default role since User model doesn't have role field
    };
  }

  async findByEmail(email: string): Promise<UserProfileResponse | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!user) return null;
    
    return {
      ...user,
      name: user.name || "",
      role: "USER" // Default role since User model doesn't have role field
    };
  }

  async findByEmailExcludeId(email: string, excludeId: string): Promise<UserProfileResponse | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: email,
        NOT: { id: excludeId }
      },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!user) return null;
    
    return {
      ...user,
      name: user.name || "",
      role: "USER" // Default role since User model doesn't have role field
    };
  }

  async update(id: string, data: { email?: string; name?: string | null; isActive?: boolean }): Promise<UserProfileResponse> {
    const user = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    return {
      ...user,
      name: user.name || "",
      role: "USER" // Default role since User model doesn't have role field
    };
  }

  async findByIdWithPassword(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!user) return null;
    
    return {
      ...user,
      name: user.name || ""
    };
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });
  }
}