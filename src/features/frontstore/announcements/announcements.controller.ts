import { FastifyRequest, FastifyReply } from "fastify";
import { FrontstoreAnnouncementService } from "./announcements.service";
import { ErrorHandler, ResponseHandler } from "../../../utils";
import { StorePrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";
import { GetFrontstoreAnnouncementsQuery } from "./announcements.schema";

export class FrontstoreAnnouncementController {
  private service: FrontstoreAnnouncementService;

  constructor(prisma: StorePrismaClient) {
    this.service = new FrontstoreAnnouncementService(prisma);
  }

  async getActiveAnnouncements(
    request: FastifyRequest<{ Querystring: GetFrontstoreAnnouncementsQuery }>,
    reply: FastifyReply
  ) {
    try {
      const result = await this.service.getActiveAnnouncements(request.query);
      return reply
        .code(200)
        .send(
          ResponseHandler.success(
            result.data,
            "Announcements retrieved successfully"
          )
        );
    } catch (error) {
      const appError = ErrorHandler.handleUnknownError(error);
      return reply
        .code(appError.statusCode)
        .send(ResponseHandler.error(appError));
    }
  }
}
