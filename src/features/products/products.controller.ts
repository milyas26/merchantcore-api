import { FastifyRequest, FastifyReply } from 'fastify';
import { ProductService } from './products.service';
import { GetProductsQuery, CreateProductRequest, UpsertProductRequest } from "./products.interface";
import { ErrorHandler, ResponseHandler } from '../../utils';
import { AppError } from '../../utils';
import { StorePrismaClient } from "../../../packages/libs/db/getPrismaForSchema";

export class ProductController {
  private productService: ProductService;

  constructor(prisma: StorePrismaClient) {
    this.productService = new ProductService(prisma);
  }

  async getProducts(
    request: FastifyRequest<{ Querystring: GetProductsQuery }>,
    reply: FastifyReply
  ) {
    try {
      const result = await this.productService.getProducts(request.query);

      if ("error" in result) {
        const error = result.error;
        const appError: AppError = {
          code: error.code,
          message: error.message,
          statusCode: 400,
          ...(error.details && { details: error.details }),
        };
        return reply
          .code(appError.statusCode)
          .send(ResponseHandler.error(appError));
      }

      return reply
        .code(200)
        .send(
          ResponseHandler.success(result.data, undefined, result.pagination)
        );
    } catch (error) {
      request.log.error(error);
      const appError = ErrorHandler.handleUnknownError(error);
      return reply
        .code(appError.statusCode)
        .send(ResponseHandler.error(appError));
    }
  }

  async getProductById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;

      if (!id) {
        const error = ErrorHandler.createError(
          "MISSING_REQUIRED_FIELDS",
          "Product ID is required"
        );
        return reply.code(error.statusCode).send(ResponseHandler.error(error));
      }

      const result = await this.productService.getProductById(id);

      // Check if error response
      if ("error" in result) {
        const error = result.error;
        const appError: AppError = {
          code: error.code,
          message: error.message,
          statusCode: error.code === "PRODUCT_NOT_FOUND" ? 404 : 400,
          ...(error.details && { details: error.details }),
        };
        return reply
          .code(appError.statusCode)
          .send(ResponseHandler.error(appError));
      }

      return reply.code(200).send(ResponseHandler.success(result.data));
    } catch (error) {
      request.log.error(error);
      const appError = ErrorHandler.handleUnknownError(error);
      return reply
        .code(appError.statusCode)
        .send(ResponseHandler.error(appError));
    }
  }

  async getProductBySlug(
    request: FastifyRequest<{ Params: { slug: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { slug } = request.params;

      if (!slug) {
        const error = ErrorHandler.createError(
          "MISSING_REQUIRED_FIELDS",
          "Product slug is required"
        );
        return reply.code(error.statusCode).send(ResponseHandler.error(error));
      }

      const result = await this.productService.getProductBySlug(slug);

      // Check if error response
      if ("error" in result) {
        const error = result.error;
        const appError: AppError = {
          code: error.code,
          message: error.message,
          statusCode: error.code === "PRODUCT_NOT_FOUND" ? 404 : 400,
          ...(error.details && { details: error.details }),
        };
        return reply
          .code(appError.statusCode)
          .send(ResponseHandler.error(appError));
      }

      return reply.code(200).send(ResponseHandler.success(result.data));
    } catch (error) {
      request.log.error(error);
      const appError = ErrorHandler.handleUnknownError(error);
      return reply
        .code(appError.statusCode)
        .send(ResponseHandler.error(appError));
    }
  }

  async checkStock(
    request: FastifyRequest<{
      Body: {
        variantId: string;
        quantity: number;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { variantId, quantity } = request.body;

      if (!variantId || !quantity) {
        const error = ErrorHandler.createError(
          "MISSING_REQUIRED_FIELDS",
          "Variant ID and quantity are required"
        );
        return reply.code(error.statusCode).send(ResponseHandler.error(error));
      }

      const result = await this.productService.checkProductStock(
        variantId,
        quantity
      );

      if ("error" in result) {
        const error = result.error;
        const appError: AppError = {
          code: error.code,
          message: error.message,
          statusCode: 400,
          ...(error.details && { details: error.details }),
        };
        return reply
          .code(appError.statusCode)
          .send(ResponseHandler.error(appError));
      }

      return reply.code(200).send(ResponseHandler.success(result));
    } catch (error) {
      request.log.error(error);
      const appError = ErrorHandler.handleUnknownError(error);
      return reply
        .code(appError.statusCode)
        .send(ResponseHandler.error(appError));
    }
  }

  async createProduct(
    request: FastifyRequest<{ Body: CreateProductRequest }>,
    reply: FastifyReply
  ) {
    try {
      const result = await this.productService.createProduct(request.body);

      // Check if error response
      if ("error" in result) {
        const error = result.error;
        const appError: AppError = {
          code: error.code,
          message: error.message,
          statusCode:
            error.code === "DUPLICATE_SLUG" ||
            error.code === "DUPLICATE_SKU" ||
            error.code === "DUPLICATE_VARIANT_SKU"
              ? 409
              : error.code === "CATEGORY_NOT_FOUND"
              ? 400
              : 400,
          ...(error.details && { details: error.details }),
        };
        return reply
          .code(appError.statusCode)
          .send(ResponseHandler.error(appError));
      }

      return reply.code(201).send(ResponseHandler.success(result.data));
    } catch (error) {
      request.log.error(error);
      const appError = ErrorHandler.handleUnknownError(error);
      return reply
        .code(appError.statusCode)
        .send(ResponseHandler.error(appError));
    }
  }

  async upsertProduct(
    request: FastifyRequest<{ Body: UpsertProductRequest }>,
    reply: FastifyReply
  ) {
    try {
      const body = request.body;
      const payload: any = {
        name: body.name,
        description: body.description,
        categoryId: body.categoryId,
        sku: body.sku,
        basePrice: typeof body.basePrice === 'string' ? Number(body.basePrice) : body.basePrice,
        compareAtPrice: body.compareAtPrice === undefined ? undefined : (typeof body.compareAtPrice === 'string' ? Number(body.compareAtPrice) : body.compareAtPrice),
        cost: body.cost === undefined ? undefined : (typeof body.cost === 'string' ? Number(body.cost) : body.cost),
        weight: body.weight === undefined ? undefined : (typeof body.weight === 'string' ? Number(body.weight) : body.weight),
        isActive: body.isActive,
        isFeatured: body.isFeatured,
        trackInventory: body.trackInventory,
        isVariant: body.isVariant,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
        images: body.images,
        variants: body.variants,
        attributes: body.attributes,
      };
      const isCreate = !body.id || Number(body.id) === 0;
      if (isCreate) {
        const result = await this.productService.createProduct(payload);
        if ("error" in result) {
          const error = result.error;
          const appError: AppError = {
            code: error.code,
            message: error.message,
            statusCode:
              error.code === "DUPLICATE_SLUG" ||
              error.code === "DUPLICATE_SKU" ||
              error.code === "DUPLICATE_VARIANT_SKU"
                ? 409
                : error.code === "CATEGORY_NOT_FOUND"
                ? 400
                : 400,
            ...(error.details && { details: error.details }),
          };
          return reply.code(appError.statusCode).send(ResponseHandler.error(appError));
        }
        return reply.code(201).send(ResponseHandler.success(result.data));
      }

      const id = String(body.id);
      const result = await this.productService.updateProduct(id, payload);
      if ("error" in result) {
        const error = result.error;
        const appError: AppError = {
          code: error.code,
          message: error.message,
          statusCode:
            error.code === "PRODUCT_NOT_FOUND" ? 404 :
            error.code === "DUPLICATE_SLUG" ||
            error.code === "DUPLICATE_SKU" ||
            error.code === "DUPLICATE_VARIANT_SKU"
              ? 409
              : error.code === "CATEGORY_NOT_FOUND"
              ? 400
              : 400,
          ...(error.details && { details: error.details }),
        };
        return reply.code(appError.statusCode).send(ResponseHandler.error(appError));
      }
      return reply.code(200).send(ResponseHandler.success(result.data));
    } catch (error) {
      request.log.error(error);
      const appError = ErrorHandler.handleUnknownError(error);
      return reply.code(appError.statusCode).send(ResponseHandler.error(appError));
    }
  }
}