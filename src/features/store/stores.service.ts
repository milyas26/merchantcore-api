import { PublicPrismaClient } from "../../../packages/libs/db/getPrismaForSchema";
import { StoresRepository } from "./stores.repository";
import { AppError } from "../../utils";
import {
  StoreListResponse,
  CreateStoreBody,
  StoreResponse,
} from "./stores.interface";
import { MembershipRole } from "./stores.interface";

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

  async createStore(
    userId: string,
    data: CreateStoreBody
  ): Promise<StoreResponse> {
    try {
      const slug = this.generateSlug(data.name);

      const result = await this.storesRepository.createStoreWithMembership({
        name: data.name,
        slug,
        description: data.description || null,
        userId,
        role: MembershipRole.OWNER,
      });

      return {
        id: result.store.id,
        slug: result.store.slug,
        name: result.store.name,
        description: result.store.description,
        isActive: result.store.isActive,
        createdAt: result.store.createdAt,
        updatedAt: result.store.updatedAt,
        membership: {
          role: result.membership.role,
          createdAt: result.membership.createdAt,
        },
      };
    } catch (error) {
      console.error("Create store error:", error);
      if (
        error instanceof Error &&
        error.message.includes("Unique constraint")
      ) {
        throw {
          code: "STORE_ALREADY_EXISTS",
          message: "A store with this name already exists",
          statusCode: 409,
        } as AppError;
      }

      throw {
        code: "CREATE_STORE_FAILED",
        message: "Failed to create store",
        statusCode: 500,
      } as AppError;
    }
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 50);
  }
}
