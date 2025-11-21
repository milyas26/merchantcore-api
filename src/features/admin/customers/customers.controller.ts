import { FastifyRequest, FastifyReply } from "fastify";
import { CustomersService } from "./customers.service";
import { ErrorHandler, ResponseHandler } from "../../../utils";
import { StorePrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";
import { GetCustomersQuery } from "./customers.schema";

export class CustomersController {
  private service: CustomersService;

  constructor(prisma: StorePrismaClient) {
    this.service = new CustomersService(prisma);
  }

  async getCustomers(
    request: FastifyRequest<{ Querystring: GetCustomersQuery }>,
    reply: FastifyReply
  ) {
    try {
      const result = await this.service.getCustomers(request.query);
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
}