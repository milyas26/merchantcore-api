import { PromotionRepository } from "./promotions.repository";
import type {
  GetPromotionsResponse,
  PromotionResponse,
  ErrorResponse,
} from "./promotions.interface";
import type {
  CreatePromotionRequest,
  UpdatePromotionRequest,
} from "./promotions.schema";
import { PromotionValidation } from "./promotions.validation";
import { AppError, ErrorHandler, ResponseHandler } from "../../../utils";
import type { StorePrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";

export class PromotionService {
  private repository: PromotionRepository;

  constructor(prisma: StorePrismaClient) {
    this.repository = new PromotionRepository(prisma);
  }

  async getPromotions(query: any): Promise<GetPromotionsResponse | ErrorResponse> {
    try {
      const validated = PromotionValidation.validateGetPromotionsQuery(query);
      const result = await this.repository.findMany(validated);
      return result as any;
    } catch (error: any) {
      if (error?.code && error?.message && error?.statusCode) {
        return ResponseHandler.error(error as AppError);
      }
      return ResponseHandler.error(ErrorHandler.handleUnknownError(error));
    }
  }

  async getPromotionById(id: string): Promise<PromotionResponse | ErrorResponse> {
    try {
      const promo = await this.repository.findById(id);
      if (!promo) {
        return ResponseHandler.error(ErrorHandler.notFoundError("Promotion", id));
      }
      return ResponseHandler.success(promo);
    } catch (error: any) {
      if (error?.code && error?.message && error?.statusCode) {
        return ResponseHandler.error(error as AppError);
      }
      return ResponseHandler.error(ErrorHandler.handleUnknownError(error));
    }
  }

  async createPromotion(data: CreatePromotionRequest): Promise<PromotionResponse | ErrorResponse> {
    try {
      const validated = PromotionValidation.validateCreatePromotion(data);

      if (validated.couponCode) {
        const existing = await this.repository.findByCouponCode(validated.couponCode);
        if (existing) {
          return ResponseHandler.error(
            ErrorHandler.createError("CONFLICT", "Kode kupon sudah digunakan")
          );
        }
      }

      const promo = await this.repository.create(validated);
      return ResponseHandler.success(promo);
    } catch (error: any) {
      if (error?.code && error?.message && error?.statusCode) {
        return ResponseHandler.error(error as AppError);
      }
      if (error?.name === "PrismaClientKnownRequestError") {
        return ResponseHandler.error(ErrorHandler.handlePrismaError(error));
      }
      return ResponseHandler.error(ErrorHandler.handleUnknownError(error));
    }
  }

  async updatePromotion(id: string, data: UpdatePromotionRequest): Promise<PromotionResponse | ErrorResponse> {
    try {
      const existing = await this.repository.findById(id);
      if (!existing) {
        return ResponseHandler.error(ErrorHandler.notFoundError("Promotion", id));
      }

      const validated = PromotionValidation.validateUpdatePromotion(data);

      if (validated.couponCode && validated.couponCode !== existing.couponCode) {
        const dup = await this.repository.findByCouponCode(validated.couponCode);
        if (dup) {
          return ResponseHandler.error(
            ErrorHandler.createError("CONFLICT", "Kode kupon sudah digunakan")
          );
        }
      }

      const promo = await this.repository.update(id, validated);
      return ResponseHandler.success(promo);
    } catch (error: any) {
      if (error?.code && error?.message && error?.statusCode) {
        return ResponseHandler.error(error as AppError);
      }
      return ResponseHandler.error(ErrorHandler.handleUnknownError(error));
    }
  }

  async deletePromotion(id: string): Promise<{ success: boolean } | ErrorResponse> {
    try {
      const existing = await this.repository.findById(id);
      if (!existing) {
        return ResponseHandler.error(ErrorHandler.notFoundError("Promotion", id));
      }
      await this.repository.delete(id);
      return { success: true };
    } catch (error: any) {
      if (error?.code && error?.message && error?.statusCode) {
        return ResponseHandler.error(error as AppError);
      }
      return ResponseHandler.error(ErrorHandler.handleUnknownError(error));
    }
  }
}
