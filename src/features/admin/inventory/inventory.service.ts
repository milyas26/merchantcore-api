import { InventoryRepository } from "./inventory.repository";
import { type GetInventoriesQuery, type GetInventoriesResponse, type UpdateInventoryBody } from "./inventory.interface";
import { AppError, ErrorHandler, ResponseHandler } from "../../../utils";
import { InventoryValidation } from "./inventory.validation";
import { StorePrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";

export class InventoryService {
  private inventoryRepository: InventoryRepository;

  constructor(prisma: StorePrismaClient) {
    this.inventoryRepository = new InventoryRepository(prisma);
  }

  async getInventories(query: GetInventoriesQuery): Promise<GetInventoriesResponse | { error: AppError }> {
    try {
      const validatedQuery = InventoryValidation.validateGetInventoriesQuery(query);
      const result = await this.inventoryRepository.findMany(validatedQuery);
      return {
        data: result.data,
        pagination: result.pagination,
      };
    } catch (error) {
      if (error instanceof Error && "code" in error && "message" in error && "statusCode" in error) {
        return ResponseHandler.error(error as AppError);
      }
      return ResponseHandler.error(ErrorHandler.handleUnknownError(error));
    }
  }

  async updateInventory(id: string, body: UpdateInventoryBody) {
    try {
      const validated = InventoryValidation.validateUpdateInventory(body);
      const updated = await this.inventoryRepository.update(id, validated);
      return ResponseHandler.success(updated);
    } catch (error) {
      if (error instanceof Error && "code" in error && "message" in error && "statusCode" in error) {
        return ResponseHandler.error(error as AppError);
      }
      return ResponseHandler.error(ErrorHandler.handleUnknownError(error));
    }
  }
}