import { ZodError } from "zod";
import { ErrorHandler } from "../../../utils";
import { getProductsQuerySchema } from "./products.schema";
import type { GetProductsQuery } from "./products.schema";

export class FrontstoreProductValidation {
  static validateGetProductsQuery(query: GetProductsQuery): GetProductsQuery {
    try {
      return getProductsQuerySchema.parse(query);
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

  static safeValidateQuery(query: GetProductsQuery): GetProductsQuery {
    try {
      return getProductsQuerySchema.parse(query);
    } catch (_error) {
      return {
        page: 1,
        limit: 20,
        published: true,
        sortBy: "createdAt",
        sortOrder: "desc",
      } as GetProductsQuery;
    }
  }
}