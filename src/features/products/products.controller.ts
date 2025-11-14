import { FastifyRequest, FastifyReply } from 'fastify';
import { ProductService } from './products.service';
import { GetProductsQuery } from './products.interface';
import { ErrorHandler, ResponseHandler } from '../../utils';
import { AppError } from '../../utils';
import { StorePrismaClient } from '../../../packages/libs/db/getPrismaForSchema';

export class ProductController {
  private productService: ProductService;

  constructor(prisma: StorePrismaClient) {
    this.productService = new ProductService(prisma);
  }

  async getProducts(request: FastifyRequest<{ Querystring: GetProductsQuery }>, reply: FastifyReply) {
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
      return reply.code(appError.statusCode).send(ResponseHandler.error(appError));
    }
  }

  async getProductById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      
      if (!id) {
        const error = ErrorHandler.createError('MISSING_REQUIRED_FIELDS', 'Product ID is required');
        return reply.code(error.statusCode).send(ResponseHandler.error(error));
      }

      const result = await this.productService.getProductById(id);
      
      // Check if error response
      if ('error' in result) {
        const error = result.error;
        const appError: AppError = {
          code: error.code,
          message: error.message,
          statusCode: error.code === 'PRODUCT_NOT_FOUND' ? 404 : 400,
          ...(error.details && { details: error.details })
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

  async getProductBySlug(request: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) {
    try {
      const { slug } = request.params;
      
      if (!slug) {
        const error = ErrorHandler.createError('MISSING_REQUIRED_FIELDS', 'Product slug is required');
        return reply.code(error.statusCode).send(ResponseHandler.error(error));
      }

      const result = await this.productService.getProductBySlug(slug);
      
      // Check if error response
      if ('error' in result) {
        const error = result.error;
        const appError: AppError = {
          code: error.code,
          message: error.message,
          statusCode: error.code === 'PRODUCT_NOT_FOUND' ? 404 : 400,
          ...(error.details && { details: error.details })
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

  async checkStock(request: FastifyRequest<{ 
    Body: { 
      variantId: string; 
      quantity: number; 
    } 
  }>, reply: FastifyReply) {
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
      return reply.code(appError.statusCode).send(ResponseHandler.error(appError));
    }
  }
}