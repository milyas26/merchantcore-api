import { FastifyReply } from "fastify";
import { AuthenticatedRequest } from "../../plugins/auth.plugin";
import { StoresService } from "./stores.service";
import { PublicPrismaClient } from "../../../packages/libs/db/getPrismaForSchema";
import { AppError } from "../../utils";

export class StoresController {
  private storesService: StoresService;

  constructor(prisma: PublicPrismaClient) {
    this.storesService = new StoresService(prisma);
  }

  async getStores(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const userId = request.user.userId;
      const result = await this.storesService.getStoresByUserId(userId);

      return reply.send({
        success: true,
        data: result,
      });
    } catch (error) {
      const appError = error as AppError;
      return reply.code(appError.statusCode || 500).send({
        success: false,
        error: {
          code: appError.code,
          message: appError.message,
        },
      });
    }
  }
}