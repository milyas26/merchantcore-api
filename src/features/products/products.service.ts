import { ProductRepository } from "./product.repository";
import {
  GetProductsResponse,
  ProductResponse,
  ErrorResponse,
} from "./products.interface";
import { AppError, ErrorHandler, ResponseHandler } from "../../utils";
import { ProductValidation } from "./products.validation";
import { GetProductsQuery } from "./products.schema";
import { PrismaClient } from "@prisma/client";

export class ProductService {
  private productRepository: ProductRepository;

  constructor(prisma: PrismaClient) {
    this.productRepository = new ProductRepository(prisma);
  }

  async getProducts(
    query: GetProductsQuery
  ): Promise<GetProductsResponse | ErrorResponse> {
    try {
      const validatedQuery = ProductValidation.validateGetProductsQuery(query);
      const result = await this.productRepository.findMany(validatedQuery);
      return {
        data: result.data,
        pagination: result.pagination,
      };
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        "message" in error &&
        "statusCode" in error
      ) {
        return ResponseHandler.error(error as AppError);
      }
      return ResponseHandler.error(ErrorHandler.handleUnknownError(error));
    }
  }

  async getProductById(id: string): Promise<ProductResponse | ErrorResponse> {
    try {
      const validatedParams = ProductValidation.validateGetProductById({ id });
      const product = await this.productRepository.findById(validatedParams.id);

      if (!product) {
        return ResponseHandler.error(
          ErrorHandler.notFoundError("Product", validatedParams.id)
        );
      }

      return ResponseHandler.success(product);
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        "message" in error &&
        "statusCode" in error
      ) {
        return ResponseHandler.error(error as AppError);
      }
      if (
        error instanceof Error &&
        error.name === "PrismaClientKnownRequestError"
      ) {
        return ResponseHandler.error(ErrorHandler.handlePrismaError(error));
      }
      return ResponseHandler.error(ErrorHandler.handleUnknownError(error));
    }
  }

  async getProductBySlug(
    slug: string
  ): Promise<ProductResponse | ErrorResponse> {
    try {
      const validatedParams = ProductValidation.validateGetProductBySlug({
        slug,
      });

      const product = await this.productRepository.findBySlug(
        validatedParams.slug
      );

      if (!product) {
        return ResponseHandler.error(
          ErrorHandler.notFoundError("Product", validatedParams.slug)
        );
      }

      return ResponseHandler.success(product);
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        "message" in error &&
        "statusCode" in error
      ) {
        return ResponseHandler.error(error as AppError);
      }
      if (
        error instanceof Error &&
        error.name === "PrismaClientKnownRequestError"
      ) {
        return ResponseHandler.error(ErrorHandler.handlePrismaError(error));
      }
      return ResponseHandler.error(ErrorHandler.handleUnknownError(error));
    }
  }

  async checkProductStock(variantId: string, quantity: number) {
    try {
      const validatedBody = ProductValidation.validateCheckStock({
        variantId,
        quantity,
      });

      const result = await this.productRepository.checkStock(
        validatedBody.variantId,
        validatedBody.quantity
      );

      return ResponseHandler.success(result);
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        "message" in error &&
        "statusCode" in error
      ) {
        return ResponseHandler.error(error as AppError);
      }
      if (
        error instanceof Error &&
        error.name === "PrismaClientKnownRequestError"
      ) {
        return ResponseHandler.error(ErrorHandler.handlePrismaError(error));
      }
      return ResponseHandler.error(ErrorHandler.handleUnknownError(error));
    }
  }
}
