// Product validation utilities
import { ZodError } from 'zod';
import { ErrorHandler } from '../../utils';
import {
  getProductsQuerySchema,
  getProductByIdSchema,
  getProductBySlugSchema,
  checkStockSchema,
  createProductSchema,
  GetProductsQuery,
  GetProductByIdParams,
  GetProductBySlugParams,
  CheckStockBody,
  CreateProductRequest,
} from './products.schema';

export class ProductValidation {
  /**
   * Validate get products query parameters
   */
  static validateGetProductsQuery(query: GetProductsQuery): GetProductsQuery {
    try {
      return getProductsQuerySchema.parse(query);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        throw ErrorHandler.validationError(
          "Invalid query parameters",
          validationErrors
        );
      }
      throw error;
    }
  }

  /**
   * Validate get product by ID parameters
   */
  static validateGetProductById(
    params: GetProductByIdParams
  ): GetProductByIdParams {
    try {
      return getProductByIdSchema.parse(params);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        throw ErrorHandler.validationError(
          "Invalid product ID",
          validationErrors
        );
      }
      throw error;
    }
  }

  /**
   * Validate get product by slug parameters
   */
  static validateGetProductBySlug(
    params: GetProductBySlugParams
  ): GetProductBySlugParams {
    try {
      return getProductBySlugSchema.parse(params);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        throw ErrorHandler.validationError(
          "Invalid product slug",
          validationErrors
        );
      }
      throw error;
    }
  }

  /**
   * Validate check stock body parameters
   */
  static validateCheckStock(body: CheckStockBody): CheckStockBody {
    try {
      return checkStockSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        throw ErrorHandler.validationError(
          "Invalid stock check parameters",
          validationErrors
        );
      }
      throw error;
    }
  }

  /**
   * Safely validate and return default values for query parameters
   */
  static safeValidateQuery(query: GetProductsQuery): GetProductsQuery {
    try {
      return getProductsQuerySchema.parse(query);
    } catch (_error) {
      // Return default values if validation fails
      return {
        page: 1,
        limit: 20,
        published: true,
        sortBy: "createdAt",
        sortOrder: "desc",
      };
    }
  }

  /**
   * Validate product creation data
   */
  static validateCreateProduct(data: CreateProductRequest): any {
    try {
      return createProductSchema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        throw ErrorHandler.validationError(
          "Invalid product data",
          validationErrors
        );
      }
      throw error;
    }
  }

  /**
   * Validate variant data (for future use)
   */
  static validateVariantData(data: any) {
    // TODO: Implement variant creation/update validation
    // This is for future use when adding variant endpoints
    return data;
  }
}