import { PublicPrismaClient } from "../../../packages/libs/db/getPrismaForSchema";
import { Store, StoreMembership } from "./stores.interface";

export class StoresRepository {
  constructor(private prisma: PublicPrismaClient) {}

  async findStoresByUserId(userId: string): Promise<(Store & { memberships: StoreMembership[] })[]> {
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
}