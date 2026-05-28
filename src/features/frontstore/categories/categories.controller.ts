import { FastifyRequest, FastifyReply } from "fastify";
import { FrontstoreCategoryService } from "./categories.service";
import { ErrorHandler, ResponseHandler } from "../../../utils";
import { StorePrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";
import { GetCategoriesQuery } from "./categories.schema";

export class FrontstoreCategoryController {
  private service: FrontstoreCategoryService;

  constructor(prisma: StorePrismaClient) {
    this.service = new FrontstoreCategoryService(prisma);
  }

  async getCategories(
    request: FastifyRequest<{ Querystring: GetCategoriesQuery }>,
    reply: FastifyReply
  ) {
    try {
      const result = await this.service.getCategories(request.query);
      return reply
        .code(200)
        .send(ResponseHandler.success(result.data, "Categories retrieved"));
    } catch (error) {
      const appError = ErrorHandler.handleUnknownError(error);
      return reply.code(appError.statusCode).send(ResponseHandler.error(appError));
    }
  }

  async getCategoryBySlug(
    request: FastifyRequest<{ Params: { slug: string } }>,
    reply: FastifyReply
  ) {
    try {
      const category = await this.service.getCategoryBySlug(request.params.slug);
      if (!category) {
        return reply
          .code(404)
          .send(ResponseHandler.error({ code: "NOT_FOUND", message: "Category not found", statusCode: 404 }));
      }
      return reply
        .code(200)
        .send(ResponseHandler.success(category, "Category retrieved"));
    } catch (error) {
      const appError = ErrorHandler.handleUnknownError(error);
      return reply.code(appError.statusCode).send(ResponseHandler.error(appError));
    }
  }
}
