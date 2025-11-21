/* eslint-disable @typescript-eslint/no-unused-vars */
import { ZodError } from "zod";
import { ErrorHandler } from "../../../utils";
import { getCustomersQuerySchema, type GetCustomersQuery } from "./customers.schema";

export class CustomersValidation {
  static validateGetCustomersQuery(query: GetCustomersQuery): GetCustomersQuery {
    try {
      return getCustomersQuerySchema.parse(query);
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

  static safeValidateQuery(query: GetCustomersQuery): GetCustomersQuery {
    try {
      return getCustomersQuerySchema.parse(query);
    } catch (_error) {
      return { page: 1, limit: 20, sortBy: "createdAt", sortOrder: "desc" } as GetCustomersQuery;
    }
  }
}