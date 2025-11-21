import { ZodError } from "zod";
import { ErrorHandler } from "../../../utils";
import { getInventoriesQuerySchema, updateInventorySchema, type GetInventoriesQuery } from "./inventory.interface";

export class InventoryValidation {
  static validateGetInventoriesQuery(query: GetInventoriesQuery): GetInventoriesQuery {
    try {
      return getInventoriesQuerySchema.parse(query);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        throw ErrorHandler.validationError("Invalid query parameters", validationErrors);
      }
      throw error as any;
    }
  }

  static validateUpdateInventory(body: { quantity: number; reserved: number }) {
    try {
      return updateInventorySchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        throw ErrorHandler.validationError('Invalid payload', validationErrors);
      }
      throw error as any;
    }
  }
}