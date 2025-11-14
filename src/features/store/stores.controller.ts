import { FastifyReply } from "fastify";
import { AuthenticatedRequest } from "../../plugins/auth.plugin";
import { StoresService } from "./stores.service";
import { PublicPrismaClient } from "../../../packages/libs/db/getPrismaForSchema";
import { AppError, ErrorHandler } from "../../utils";
import { z, ZodError } from "zod";
import { createStoreSchema } from "./stores.validation";
import { CreateStoreBody } from "./stores.interface";

export class StoresController {
  private storesService: StoresService;

  constructor(prisma: PublicPrismaClient) {
    this.storesService = new StoresService(prisma);
  }

  private validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        throw ErrorHandler.validationError(
          "Validation failed",
          validationErrors
        );
      }
      throw error;
    }
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

  async createStore(
    request: AuthenticatedRequest<{ Body: CreateStoreBody }>,
    reply: FastifyReply
  ) {
    try {
      const body = this.validateRequest(
        createStoreSchema,
        request.body
      ) as CreateStoreBody;
      const userId = request.user.userId;
      const result = await this.storesService.createStore(userId, body);

      return reply.code(201).send({
        success: true,
        data: {
          store: result,
        },
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

  async switchStore(
    request: AuthenticatedRequest<{ Body: { storeId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { storeId } = request.body;
      const userId = request.user.userId;

      if (!storeId) {
        throw ErrorHandler.validationError("Store id is required");
      }

      const currentStore = await this.storesService.switchStore(
        userId,
        storeId
      );

      return reply.send({
        success: true,
        data: {
          currentStore,
        },
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
