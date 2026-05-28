import { ZodError } from "zod";
import { ErrorHandler } from "../../../utils";
import { getCategoriesQuerySchema } from "./categories.schema";
import type { GetCategoriesQuery } from "./categories.schema";

export class FrontstoreCategoryValidation {
  static safeValidateQuery(query: GetCategoriesQuery): GetCategoriesQuery {
    try {
      return getCategoriesQuerySchema.parse(query);
    } catch (_error) {
      return { includeEmpty: false } as GetCategoriesQuery;
    }
  }

  static validateQuery(query: GetCategoriesQuery): GetCategoriesQuery {
    try {
      return getCategoriesQuerySchema.parse(query);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        throw ErrorHandler.validationError("Invalid query parameters", validationErrors);
      }
      throw error as Error;
    }
  }
}
