import { FastifyRequest, FastifyReply } from "fastify";
import { FrontstoreOrderService } from "./orders.service";
import { ErrorHandler, ResponseHandler } from "../../../utils";
import { StorePrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";
import type { AuthenticatedRequest } from "../../../plugins/auth.plugin";
import type { CreateOrderBody } from "./orders.schema";
import { createOrderSchema } from "./orders.schema";

export class FrontstoreOrderController {
  private service: FrontstoreOrderService;

  constructor(prisma: StorePrismaClient) {
    this.service = new FrontstoreOrderService(prisma);
  }

  async checkout(
    request: AuthenticatedRequest<{ Body: CreateOrderBody & { cartId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const validated = createOrderSchema.parse(request.body);
      const cartId = request.body.cartId;
      if (!cartId) {
        return reply
          .code(400)
          .send(ResponseHandler.error({ code: "BAD_REQUEST", message: "cartId is required", statusCode: 400 }));
      }
      const result = await this.service.checkout(request.user.userId, cartId, validated);
      return reply.code(201).send(ResponseHandler.success(result, "Order created"));
    } catch (error) {
      const appError = ErrorHandler.handleUnknownError(error);
      return reply.code(appError.statusCode).send(ResponseHandler.error(appError));
    }
  }

  async getOrder(
    request: AuthenticatedRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const result = await this.service.getOrder(request.params.id, request.user.userId);
      return reply.code(200).send(ResponseHandler.success(result, "Order retrieved"));
    } catch (error) {
      const appError = ErrorHandler.handleUnknownError(error);
      return reply.code(appError.statusCode).send(ResponseHandler.error(appError));
    }
  }

  async getOrders(
    request: AuthenticatedRequest,
    reply: FastifyReply
  ) {
    try {
      const result = await this.service.getOrders(request.user.userId);
      return reply.code(200).send(ResponseHandler.success(result, "Orders retrieved"));
    } catch (error) {
      const appError = ErrorHandler.handleUnknownError(error);
      return reply.code(appError.statusCode).send(ResponseHandler.error(appError));
    }
  }
}
