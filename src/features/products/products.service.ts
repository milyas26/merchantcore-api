import { PrismaClient } from "@prisma/client";
import { ProductRepository } from "./product.repository";
import {
  GetProductsResponse,
  ProductResponse,
  ErrorResponse,
} from "./products.interface";
import { AppError, ErrorHandler, ResponseHandler } from "../../utils";
import { ProductValidation } from "./products.validation";
import { GetProductsQuery } from "./products.schema";

export class ProductService {
  private productRepository: ProductRepository;

  constructor(prisma: PrismaClient) {
    this.productRepository = new ProductRepository(prisma);
  }

  async getProducts(
    query: GetProductsQuery
  ): Promise<GetProductsResponse | ErrorResponse> {
    try {
      // Validate query parameters using Zod
      const validatedQuery = ProductValidation.validateGetProductsQuery(query);

      // Get products from repository
      const result = await this.productRepository.findMany(validatedQuery);

      // Convert Decimal to number for price and dimensions
      const processedData = result.data.map((product) => ({
        ...product,
        price: product.price ? Number(product.price) : 0,
        variants: product.variants.map((variant) => ({
          ...variant,
          price: variant.price ? Number(variant.price) : 0,
          weight: variant.weight ? Number(variant.weight) : null,
          length: variant.length ? Number(variant.length) : null,
          width: variant.width ? Number(variant.width) : null,
          height: variant.height ? Number(variant.height) : null,
        })),
      }));

      return {
        data: processedData,
        pagination: result.pagination,
      };
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        "message" in error &&
        "statusCode" in error
      ) {
        // This is already an AppError from validation
        return ResponseHandler.error(error as AppError);
      }
      return ResponseHandler.error(ErrorHandler.handleUnknownError(error));
    }
  }

  async getProductById(id: string): Promise<ProductResponse | ErrorResponse> {
    try {
      // Validate ID using Zod
      const validatedParams = ProductValidation.validateGetProductById({ id });

      // Get product from repository
      const product = await this.productRepository.findById(validatedParams.id);

      if (!product) {
        return ResponseHandler.error(
          ErrorHandler.notFoundError("Product", validatedParams.id)
        );
      }

      // Convert Decimal to number for price and dimensions
      const processedProduct = {
        ...product,
        price: product.price ? Number(product.price) : 0,
        variants: product.variants.map((variant) => ({
          ...variant,
          price: variant.price ? Number(variant.price) : 0,
          weight: variant.weight ? Number(variant.weight) : null,
          length: variant.length ? Number(variant.length) : null,
          width: variant.width ? Number(variant.width) : null,
          height: variant.height ? Number(variant.height) : null,
        })),
      };

      return ResponseHandler.success(processedProduct);
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        "message" in error &&
        "statusCode" in error
      ) {
        // This is already an AppError from validation
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
      // Validate slug using Zod
      const validatedParams = ProductValidation.validateGetProductBySlug({
        slug,
      });

      // Get product from repository
      const product = await this.productRepository.findBySlug(
        validatedParams.slug
      );

      if (!product) {
        return ResponseHandler.error(
          ErrorHandler.notFoundError("Product", validatedParams.slug)
        );
      }

      // Convert Decimal to number for price and dimensions
      const processedProduct = {
        ...product,
        price: product.price ? Number(product.price) : 0,
        variants: product.variants.map((variant) => ({
          ...variant,
          price: variant.price ? Number(variant.price) : 0,
          weight: variant.weight ? Number(variant.weight) : null,
          length: variant.length ? Number(variant.length) : null,
          width: variant.width ? Number(variant.width) : null,
          height: variant.height ? Number(variant.height) : null,
        })),
      };

      return ResponseHandler.success(processedProduct);
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        "message" in error &&
        "statusCode" in error
      ) {
        // This is already an AppError from validation
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
      // Validate inputs using Zod
      const validatedBody = ProductValidation.validateCheckStock({
        variantId,
        quantity,
      });

      // Check stock from repository
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
        // This is already an AppError from validation
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
