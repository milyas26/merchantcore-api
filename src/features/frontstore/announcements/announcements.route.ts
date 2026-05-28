import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { FrontstoreAnnouncementController } from "./announcements.controller";
import { getPrismaForSchema } from "../../../../packages/libs/db/getPrismaForSchema";
import type { GetFrontstoreAnnouncementsQuery } from "./announcements.schema";

export default async function frontstoreAnnouncementRoutes(fastify: FastifyInstance) {
  fastify.addHook(
    "preHandler",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const storeHeader = request.headers["x-store"];
      if (!storeHeader || typeof storeHeader !== "string" || storeHeader.trim() === "") {
        return reply
          .code(400)
          .send({
            success: false,
            data: [],
            message: "x-store header is required",
          });
      }
    }
  );

  fastify.get(
    "/",
    async (
      request: FastifyRequest<{ Querystring: GetFrontstoreAnnouncementsQuery }>,
      reply: FastifyReply
    ) => {
      const storeSlug = String(request.headers["x-store"]);
      const prisma = getPrismaForSchema(storeSlug);
      const controller = new FrontstoreAnnouncementController(prisma);
      return controller.getActiveAnnouncements(request, reply);
    }
  );
}
