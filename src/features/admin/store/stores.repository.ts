import { PublicPrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";
import { Store, StoreMembership, MembershipRole } from "./stores.interface";

export class StoresRepository {
  constructor(private prisma: PublicPrismaClient) {}

  async findStoresByUserId(
    userId: string
  ): Promise<(Store & { memberships: StoreMembership[] })[]> {
    const stores = await this.prisma.store.findMany({
      where: {
        memberships: {
          some: {
            userId,
          },
        },
      },
      include: {
        memberships: {
          where: {
            userId,
          },
        },
      },
    });

    return stores as (Store & { memberships: StoreMembership[] })[];
  }

  async findMembershipByUserIdAndStoreId(
    userId: string,
    storeId: string
  ): Promise<StoreMembership | null> {
    const membership = await this.prisma.storeMembership.findFirst({
      where: {
        userId,
        storeId,
      },
    });

    return membership as StoreMembership | null;
  }

  async findStoreById(storeId: string): Promise<Store | null> {
    const store = await this.prisma.store.findUnique({
      where: {
        id: storeId,
      },
    });

    return store as Store | null;
  }

  async createStoreWithMembership(data: {
    name: string;
    slug: string;
    description: string | null;
    userId: string;
    role: MembershipRole;
  }): Promise<{ store: Store; membership: StoreMembership }> {
    const result = await this.prisma.$transaction(async (tx) => {
      const store = await tx.store.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          isActive: true,
        },
      });

      const membership = await tx.storeMembership.create({
        data: {
          userId: data.userId,
          storeId: store.id,
          role: data.role as MembershipRole,
        },
      });

      return {
        store: store as Store,
        membership: membership as StoreMembership,
      };
    });

    return result;
  }
}