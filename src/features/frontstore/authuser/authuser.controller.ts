import { FastifyRequest, FastifyReply } from "fastify";
import { FrontstoreAuthUserService } from "./authuser.service";
import { ErrorHandler, ResponseHandler } from "../../../utils";
import { StorePrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";
import type { AuthenticatedRequest } from "../../../plugins/auth.plugin";
import type { UpdateProfileBody, AddAddressBody } from "./authuser.schema";
import { updateProfileSchema, addAddressSchema } from "./authuser.schema";

export class FrontstoreAuthUserController {
  private service: FrontstoreAuthUserService;

  constructor(prisma: StorePrismaClient) {
    this.service = new FrontstoreAuthUserService(prisma);
  }

  async getProfile(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const result = await this.service.getProfile(request.user.userId);
      return reply.code(200).send(ResponseHandler.success(result, "Profile retrieved"));
    } catch (error) {
      const appError = ErrorHandler.handleUnknownError(error);
      return reply.code(appError.statusCode).send(ResponseHandler.error(appError));
    }
  }

  async updateProfile(
    request: AuthenticatedRequest<{ Body: UpdateProfileBody }>,
    reply: FastifyReply
  ) {
    try {
      const validated = updateProfileSchema.parse(request.body);
      const result = await this.service.updateProfile(request.user.userId, validated);
      return reply.code(200).send(ResponseHandler.success(result, "Profile updated"));
    } catch (error) {
      const appError = ErrorHandler.handleUnknownError(error);
      return reply.code(appError.statusCode).send(ResponseHandler.error(appError));
    }
  }

  async addAddress(
    request: AuthenticatedRequest<{ Body: AddAddressBody }>,
    reply: FastifyReply
  ) {
    try {
      const validated = addAddressSchema.parse(request.body);
      const result = await this.service.addAddress(request.user.userId, validated);
      return reply.code(201).send(ResponseHandler.success(result, "Address added"));
    } catch (error) {
      const appError = ErrorHandler.handleUnknownError(error);
      return reply.code(appError.statusCode).send(ResponseHandler.error(appError));
    }
  }
}
