import { FastifyRequest, FastifyReply } from "fastify";
import { OrdersService } from "./orders.service";
import { ErrorHandler, ResponseHandler } from "../../../utils";
import { StorePrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";
import { GetOrdersQuery, UpdateOrderStatusBody, UpdatePaymentStatusBody } from "./orders.schema";
import { updateOrderStatusSchema, updatePaymentStatusSchema } from "./orders.schema";

export class OrdersController {
  private service: OrdersService;

  constructor(prisma: StorePrismaClient) {
    this.service = new OrdersService(prisma);
  }

  async getOrders(
    request: FastifyRequest<{ Querystring: GetOrdersQuery }>,
    reply: FastifyReply
  ) {
    try {
      const result = await this.service.getOrders(request.query);
      if ("error" in result) {
        const error = result.error;
        return reply
          .code(400)
          .send(
            ResponseHandler.error({
              code: error.code,
              message: error.message,
              statusCode: 400,
              ...(error.details && { details: error.details }),
            })
          );
      }
      return reply
        .code(200)
        .send(ResponseHandler.success(result.data, undefined, result.pagination));
    } catch (error) {
      const appError = ErrorHandler.handleUnknownError(error);
      return reply.code(appError.statusCode).send(ResponseHandler.error(appError));
    }
  }

  async getOrderById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const id = String(request.params.id);
      const result = await this.service.getOrderById(id);
      if ("error" in result) {
        const error = result.error;
        const statusCode = error.code === "NOT_FOUND" ? 404 : 400;
        return reply
          .code(statusCode)
          .send(
            ResponseHandler.error({
              code: error.code,
              message: error.message,
              statusCode,
              ...(error.details && { details: error.details }),
            })
          );
      }
      return reply.code(200).send(ResponseHandler.success(result.data));
    } catch (error) {
      const appError = ErrorHandler.handleUnknownError(error);
      return reply.code(appError.statusCode).send(ResponseHandler.error(appError));
    }
  }

  async updateOrderStatus(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateOrderStatusBody }>,
    reply: FastifyReply
  ) {
    try {
      const validated = updateOrderStatusSchema.parse(request.body);
      const result = await this.service.updateStatus(request.params.id, validated);
      if ("error" in result) {
        return reply.code(result.error.statusCode).send(ResponseHandler.error(result.error));
      }
      return reply.code(200).send(ResponseHandler.success(result.data, "Order status updated"));
    } catch (error) {
      const appError = ErrorHandler.handleUnknownError(error);
      return reply.code(appError.statusCode).send(ResponseHandler.error(appError));
    }
  }

  async updatePaymentStatus(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdatePaymentStatusBody }>,
    reply: FastifyReply
  ) {
    try {
      const validated = updatePaymentStatusSchema.parse(request.body);
      const result = await this.service.updatePaymentStatus(request.params.id, validated);
      if ("error" in result) {
        return reply.code(result.error.statusCode).send(ResponseHandler.error(result.error));
      }
      return reply.code(200).send(ResponseHandler.success(result.data, "Payment status updated"));
    } catch (error) {
      const appError = ErrorHandler.handleUnknownError(error);
      return reply.code(appError.statusCode).send(ResponseHandler.error(appError));
    }
  }
}