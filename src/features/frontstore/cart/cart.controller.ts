import { FastifyRequest, FastifyReply } from "fastify";
import { FrontstoreCartService } from "./cart.service";
import { ErrorHandler, ResponseHandler } from "../../../utils";
import { StorePrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";
import type { AuthenticatedRequest } from "../../../plugins/auth.plugin";
import type { AddCartItemBody, UpdateCartItemBody } from "./cart.schema";
import { addCartItemSchema, updateCartItemSchema } from "./cart.schema";

export class FrontstoreCartController {
  private service: FrontstoreCartService;

  constructor(prisma: StorePrismaClient) {
    this.service = new FrontstoreCartService(prisma);
  }

  async getCart(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const result = await this.service.getCart(request.user?.userId);
      return reply.code(200).send(ResponseHandler.success(result, "Cart retrieved"));
    } catch (error) {
      const appError = ErrorHandler.handleUnknownError(error);
      return reply.code(appError.statusCode).send(ResponseHandler.error(appError));
    }
  }

  async addItem(
    request: AuthenticatedRequest<{ Body: AddCartItemBody }>,
    reply: FastifyReply
  ) {
    try {
      const validated = addCartItemSchema.parse(request.body);
      const result = await this.service.addItem(
        request.user.userId,
        validated.productId,
        validated.quantity
      );
      return reply.code(200).send(ResponseHandler.success(result, "Item added to cart"));
    } catch (error) {
      const appError = ErrorHandler.handleUnknownError(error);
      return reply.code(appError.statusCode).send(ResponseHandler.error(appError));
    }
  }

  async updateItem(
    request: AuthenticatedRequest<{ Params: { id: string }; Body: UpdateCartItemBody }>,
    reply: FastifyReply
  ) {
    try {
      const validated = updateCartItemSchema.parse(request.body);
      const result = await this.service.updateItem(
        request.user.userId,
        request.params.id,
        validated.quantity
      );
      return reply.code(200).send(ResponseHandler.success(result, "Cart item updated"));
    } catch (error) {
      const appError = ErrorHandler.handleUnknownError(error);
      return reply.code(appError.statusCode).send(ResponseHandler.error(appError));
    }
  }

  async removeItem(
    request: AuthenticatedRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const result = await this.service.removeItem(request.user.userId, request.params.id);
      return reply.code(200).send(ResponseHandler.success(result, "Cart item removed"));
    } catch (error) {
      const appError = ErrorHandler.handleUnknownError(error);
      return reply.code(appError.statusCode).send(ResponseHandler.error(appError));
    }
  }
}
