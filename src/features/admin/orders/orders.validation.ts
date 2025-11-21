import { ZodError } from "zod";
import { ErrorHandler } from "../../../utils";
import { getOrdersQuerySchema, type GetOrdersQuery } from "./orders.schema";

export class OrdersValidation {
  static validateGetOrdersQuery(query: GetOrdersQuery): GetOrdersQuery {
    try {
      return getOrdersQuerySchema.parse(query);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        throw ErrorHandler.validationError("Invalid query parameters", validationErrors);
      }
      throw error;
    }
  }

  static safeValidateQuery(query: GetOrdersQuery): GetOrdersQuery {
    try {
      return getOrdersQuerySchema.parse(query);
    } catch (_error) {
      return { page: 1, limit: 20, sortBy: "createdAt", sortOrder: "desc" } as GetOrdersQuery;
    }
  }
}