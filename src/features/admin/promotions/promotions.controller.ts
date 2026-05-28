import type { FastifyRequest, FastifyReply } from "fastify";
import { PromotionService } from "./promotions.service";
import type { GetPromotionsQuery, CreatePromotionRequest, UpdatePromotionRequest } from "./promotions.schema";
import { ErrorHandler, ResponseHandler, type AppError } from "../../../utils";
import type { StorePrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";

export class PromotionController {
  private service: PromotionService;

  constructor(prisma: StorePrismaClient) {
    this.service = new PromotionService(prisma);
  }

  async getPromotions(
    request: FastifyRequest<{ Querystring: GetPromotionsQuery }>,
    reply: FastifyReply
  ) {
    try {
      const result = await this.service.getPromotions(request.query);
      if ("error" in result) {
        const e = result.error;
        const appError: AppError = { code: e.code, message: e.message, statusCode: 400 };
        return reply.code(400).send(ResponseHandler.error(appError));
      }
      return reply.code(200).send(
        ResponseHandler.success(result.data, undefined, result.pagination)
      );
    } catch (error) {
      request.log.error(error);
      const e = ErrorHandler.handleUnknownError(error);
      return reply.code(e.statusCode).send(ResponseHandler.error(e));
    }
  }

  async getPromotionById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const result = await this.service.getPromotionById(request.params.id);
      if ("error" in result) {
        const e = result.error;
        const statusCode = e.code === "NOT_FOUND" ? 404 : 400;
        const appError: AppError = { code: e.code, message: e.message, statusCode };
        return reply.code(statusCode).send(ResponseHandler.error(appError));
      }
      return reply.code(200).send(ResponseHandler.success(result.data));
    } catch (error) {
      request.log.error(error);
      const e = ErrorHandler.handleUnknownError(error);
      return reply.code(e.statusCode).send(ResponseHandler.error(e));
    }
  }

  async createPromotion(
    request: FastifyRequest<{ Body: CreatePromotionRequest }>,
    reply: FastifyReply
  ) {
    try {
      const result = await this.service.createPromotion(request.body);
      if ("error" in result) {
        const e = result.error;
        const statusCode = e.code === "CONFLICT" ? 409 : 400;
        const appError: AppError = { code: e.code, message: e.message, statusCode };
        return reply.code(statusCode).send(ResponseHandler.error(appError));
      }
      return reply.code(201).send(ResponseHandler.success(result.data));
    } catch (error) {
      request.log.error(error);
      const e = ErrorHandler.handleUnknownError(error);
      return reply.code(e.statusCode).send(ResponseHandler.error(e));
    }
  }

  async updatePromotion(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdatePromotionRequest }>,
    reply: FastifyReply
  ) {
    try {
      const result = await this.service.updatePromotion(request.params.id, request.body);
      if ("error" in result) {
        const e = result.error;
        const statusCode = e.code === "NOT_FOUND" ? 404 : 400;
        const appError: AppError = { code: e.code, message: e.message, statusCode };
        return reply.code(statusCode).send(ResponseHandler.error(appError));
      }
      return reply.code(200).send(ResponseHandler.success(result.data));
    } catch (error) {
      request.log.error(error);
      const e = ErrorHandler.handleUnknownError(error);
      return reply.code(e.statusCode).send(ResponseHandler.error(e));
    }
  }

  async deletePromotion(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const result = await this.service.deletePromotion(request.params.id);
      if ("error" in result) {
        const e = result.error;
        const statusCode = e.code === "NOT_FOUND" ? 404 : 400;
        const appError: AppError = { code: e.code, message: e.message, statusCode };
        return reply.code(statusCode).send(ResponseHandler.error(appError));
      }
      return reply.code(200).send(ResponseHandler.success(null, "Promotion deleted"));
    } catch (error) {
      request.log.error(error);
      const e = ErrorHandler.handleUnknownError(error);
      return reply.code(e.statusCode).send(ResponseHandler.error(e));
    }
  }
}
