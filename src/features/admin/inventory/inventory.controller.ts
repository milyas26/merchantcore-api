import { FastifyRequest, FastifyReply } from "fastify";
import { InventoryService } from "./inventory.service";
import { type GetInventoriesQuery, type UpdateInventoryBody } from "./inventory.interface";
import { ErrorHandler, ResponseHandler, AppError } from "../../../utils";
import { StorePrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";

export class InventoryController {
  private inventoryService: InventoryService;

  constructor(prisma: StorePrismaClient) {
    this.inventoryService = new InventoryService(prisma);
  }

  async getInventories(
    request: FastifyRequest<{ Querystring: GetInventoriesQuery }>,
    reply: FastifyReply
  ) {
    try {
      const result = await this.inventoryService.getInventories(request.query);
      if ("error" in result) {
        const error = result.error;
        const appError: AppError = {
          code: error.code,
          message: error.message,
          statusCode: 400,
          ...(error.details && { details: error.details }),
        };
        return reply.code(appError.statusCode).send(ResponseHandler.error(appError));
      }
      return reply.code(200).send(ResponseHandler.success(result.data, undefined, result.pagination));
    } catch (error) {
      const appError = ErrorHandler.handleUnknownError(error);
      return reply.code(appError.statusCode).send(ResponseHandler.error(appError));
    }
  }

  async updateInventory(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateInventoryBody }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const result = await this.inventoryService.updateInventory(id, request.body);
      if ("error" in result) {
        const error = result.error;
        const appError: AppError = {
          code: error.code,
          message: error.message,
          statusCode: 400,
          ...(error.details && { details: error.details }),
        };
        return reply.code(appError.statusCode).send(ResponseHandler.error(appError));
      }
      return reply.code(200).send(result);
    } catch (error) {
      const appError = ErrorHandler.handleUnknownError(error);
      return reply.code(appError.statusCode).send(ResponseHandler.error(appError));
    }
  }
}