import {
  getPromotionsQuerySchema,
  createPromotionSchema,
  updatePromotionSchema,
  type GetPromotionsQuery,
  type CreatePromotionRequest,
  type UpdatePromotionRequest,
} from "./promotions.schema";
import { ErrorHandler } from "../../../utils";
import { ZodError } from "zod";

export class PromotionValidation {
  static validateGetPromotionsQuery(query: GetPromotionsQuery) {
    try {
      return getPromotionsQuerySchema.parse(query);
    } catch (error) {
      if (error instanceof ZodError) {
        throw ErrorHandler.validationError(
          "Invalid query parameters",
          error.errors.map((e) => ({ field: e.path.join("."), message: e.message }))
        );
      }
      throw error;
    }
  }

  static validateCreatePromotion(data: CreatePromotionRequest) {
    try {
      return createPromotionSchema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw ErrorHandler.validationError(
          "Invalid promotion data",
          error.errors.map((e) => ({ field: e.path.join("."), message: e.message }))
        );
      }
      throw error;
    }
  }

  static validateUpdatePromotion(data: UpdatePromotionRequest) {
    try {
      return updatePromotionSchema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw ErrorHandler.validationError(
          "Invalid promotion data",
          error.errors.map((e) => ({ field: e.path.join("."), message: e.message }))
        );
      }
      throw error;
    }
  }
}
