import type { FastifyRequest, FastifyReply } from "fastify";
import { AnnouncementService } from "./announcements.service";
import type {
  GetAnnouncementsQuery,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
} from "./announcements.schema";
import { ErrorHandler, ResponseHandler, type AppError } from "../../../utils";
import type { StorePrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";
import type { AuthenticatedRequest } from "../../../plugins/auth.plugin";

export class AnnouncementController {
  private service: AnnouncementService;

  constructor(prisma: StorePrismaClient) {
    this.service = new AnnouncementService(prisma);
  }

  async getAnnouncements(
    request: FastifyRequest<{ Querystring: GetAnnouncementsQuery }>,
    reply: FastifyReply
  ) {
    try {
      const result = await this.service.getAnnouncements(request.query);
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

  async getAnnouncementById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const result = await this.service.getAnnouncementById(request.params.id);
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

  async createAnnouncement(
    request: FastifyRequest<{ Body: CreateAnnouncementRequest }>,
    reply: FastifyReply
  ) {
    try {
      const auth = request as AuthenticatedRequest;
      const createdBy = auth.user?.userId || "unknown";
      const result = await this.service.createAnnouncement(request.body, createdBy);
      if ("error" in result) {
        const e = result.error;
        const appError: AppError = { code: e.code, message: e.message, statusCode: 400 };
        return reply.code(400).send(ResponseHandler.error(appError));
      }
      return reply.code(201).send(ResponseHandler.success(result.data));
    } catch (error) {
      request.log.error(error);
      const e = ErrorHandler.handleUnknownError(error);
      return reply.code(e.statusCode).send(ResponseHandler.error(e));
    }
  }

  async updateAnnouncement(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateAnnouncementRequest }>,
    reply: FastifyReply
  ) {
    try {
      const result = await this.service.updateAnnouncement(request.params.id, request.body);
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

  async deleteAnnouncement(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const result = await this.service.deleteAnnouncement(request.params.id);
      if ("error" in result) {
        const e = result.error;
        const statusCode = e.code === "NOT_FOUND" ? 404 : 400;
        const appError: AppError = { code: e.code, message: e.message, statusCode };
        return reply.code(statusCode).send(ResponseHandler.error(appError));
      }
      return reply.code(200).send(ResponseHandler.success(null, "Announcement deleted"));
    } catch (error) {
      request.log.error(error);
      const e = ErrorHandler.handleUnknownError(error);
      return reply.code(e.statusCode).send(ResponseHandler.error(e));
    }
  }
}
