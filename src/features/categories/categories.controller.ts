import { FastifyRequest, FastifyReply } from 'fastify';
import { CategoryService } from './categories.service';
import { GetCategoriesQuery, CreateCategoryRequest } from "./categories.interface";
import { ErrorHandler, ResponseHandler } from '../../utils';
import { AppError } from '../../utils';
import { PrismaClient } from "@prisma/client";
import { getCategoriesQuerySchema } from "./categories.schema";

export class CategoryController {
  private categoryService: CategoryService;

  constructor(prisma: PrismaClient) {
    this.categoryService = new CategoryService(prisma);
  }

  async getCategories(
    request: FastifyRequest<{ Querystring: GetCategoriesQuery }>,
    reply: FastifyReply
  ) {
    try {
      // Validate query parameters
      const validationResult = getCategoriesQuerySchema.safeParse(
        request.query
      );
      if (!validationResult.success) {
        const appError: AppError = {
          code: "VALIDATION_ERROR",
          message: "Invalid query parameters",
          statusCode: 400,
          details: validationResult.error.flatten(),
        };
        return reply
          .code(appError.statusCode)
          .send(ResponseHandler.error(appError));
      }

      const validatedQuery = validationResult.data;
      const result = await this.categoryService.getCategories(validatedQuery);

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

  async getCategoryById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;

      if (!id) {
        const error = ErrorHandler.createError(
          "MISSING_REQUIRED_FIELDS",
          "Category ID is required"
        );
        return reply.code(error.statusCode).send(ResponseHandler.error(error));
      }

      const result = await this.categoryService.getCategoryById(id);

      // Check if error response
      if ("error" in result) {
        const error = result.error;
        const appError: AppError = {
          code: error.code,
          message: error.message,
          statusCode: error.code === "CATEGORY_NOT_FOUND" ? 404 : 400,
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

  async getCategoryBySlug(
    request: FastifyRequest<{ Params: { slug: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { slug } = request.params;

      if (!slug) {
        const error = ErrorHandler.createError(
          "MISSING_REQUIRED_FIELDS",
          "Category slug is required"
        );
        return reply.code(error.statusCode).send(ResponseHandler.error(error));
      }

      const result = await this.categoryService.getCategoryBySlug(slug);

      // Check if error response
      if ("error" in result) {
        const error = result.error;
        const appError: AppError = {
          code: error.code,
          message: error.message,
          statusCode: error.code === "CATEGORY_NOT_FOUND" ? 404 : 400,
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

  async createCategory(
    request: FastifyRequest<{ Body: CreateCategoryRequest }>,
    reply: FastifyReply
  ) {
    try {
      const result = await this.categoryService.createCategory(request.body);

      // Check if error response
      if ("error" in result) {
        const error = result.error;
        const appError: AppError = {
          code: error.code,
          message: error.message,
          statusCode:
            error.code === "DUPLICATE_SLUG"
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
}