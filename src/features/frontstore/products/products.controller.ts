import { FastifyRequest, FastifyReply } from "fastify";
import { FrontstoreProductService } from "./products.service";
import { ErrorHandler, ResponseHandler } from "../../../utils";
import { StorePrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";
import { GetProductsQuery } from "./products.schema";

export class FrontstoreProductController {
  private service: FrontstoreProductService;

  constructor(prisma: StorePrismaClient) {
    this.service = new FrontstoreProductService(prisma);
  }

  async getProducts(
    request: FastifyRequest<{ Querystring: GetProductsQuery }>,
    reply: FastifyReply
  ) {
    try {
      const result = await this.service.getProducts(request.query);
      return reply
        .code(200)
        .send(
          ResponseHandler.success(
            result.data,
            "Products retrieved successfully",
            result.pagination
          )
        );
    } catch (error) {
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
      const result = await this.service.getProductBySlug(request.params.slug);
      if (!result) {
        return reply
          .code(404)
          .send(ResponseHandler.error({ code: "NOT_FOUND", message: "Product not found", statusCode: 404 }));
      }
      return reply
        .code(200)
        .send(ResponseHandler.success(result, "Product retrieved"));
    } catch (error) {
      const appError = ErrorHandler.handleUnknownError(error);
      return reply
        .code(appError.statusCode)
        .send(ResponseHandler.error(appError));
    }
  }
}