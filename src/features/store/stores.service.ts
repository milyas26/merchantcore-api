import { PublicPrismaClient } from "../../../packages/libs/db/getPrismaForSchema";
import { StoresRepository } from "./stores.repository";
import { AppError } from "../../utils";
import { StoreListResponse } from "./stores.interface";

export class StoresService {
  private storesRepository: StoresRepository;

  constructor(prisma: PublicPrismaClient) {
    this.storesRepository = new StoresRepository(prisma);
  }

  async getStoresByUserId(userId: string): Promise<StoreListResponse> {
    try {
      const stores = await this.storesRepository.findStoresByUserId(userId);

      const storesWithMembership = stores.map((store) => {
        const membership =
          store.memberships.length > 0
            ? {
                role: store.memberships[0].role,
                createdAt: store.memberships[0].createdAt,
              }
            : undefined;

        return {
          id: store.id,
          slug: store.slug,
          name: store.name,
          description: store.description,
          isActive: store.isActive,
          createdAt: store.createdAt,
          updatedAt: store.updatedAt,
          membership,
        };
      });

      return {
        stores: storesWithMembership,
        total: storesWithMembership.length,
      };
    } catch (error) {
      console.error("Get stores by user error:", error);
      throw {
        code: "GET_STORES_FAILED",
        message: "Failed to get stores for user",
        statusCode: 500,
      } as AppError;
    }
  }
}
