import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { AnnouncementController } from "./announcements.controller";
import type {
  GetAnnouncementsQuery,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
} from "./announcements.schema";
import type { AuthenticatedRequest } from "../../../plugins/auth.plugin";
import { getPrismaForSchema } from "../../../../packages/libs/db/getPrismaForSchema";

export default async function announcementRoutes(fastify: FastifyInstance) {
  const getStoreSchema = (request: FastifyRequest): string => {
    const auth = request as AuthenticatedRequest;
    const store = auth.user?.currentStore;
    if (!store?.slug) throw new Error("No store selected");
    return store.slug;
  };

  fastify.addHook("preHandler", async (request: FastifyRequest, reply: FastifyReply) => {
    await fastify.authenticate(request as AuthenticatedRequest, reply);
  });

  fastify.get("/", async (
    request: FastifyRequest<{ Querystring: GetAnnouncementsQuery }>,
    reply: FastifyReply
  ) => {
    const schema = getStoreSchema(request);
    const prisma = getPrismaForSchema(schema);
    const ctrl = new AnnouncementController(prisma);
    return ctrl.getAnnouncements(request, reply);
  });

  fastify.get("/:id", async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    const schema = getStoreSchema(request);
    const prisma = getPrismaForSchema(schema);
    const ctrl = new AnnouncementController(prisma);
    return ctrl.getAnnouncementById(request, reply);
  });

  fastify.post("/", async (
    request: FastifyRequest<{ Body: CreateAnnouncementRequest }>,
    reply: FastifyReply
  ) => {
    const schema = getStoreSchema(request);
    const prisma = getPrismaForSchema(schema);
    const ctrl = new AnnouncementController(prisma);
    return ctrl.createAnnouncement(request, reply);
  });

  fastify.put("/:id", async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateAnnouncementRequest }>,
    reply: FastifyReply
  ) => {
    const schema = getStoreSchema(request);
    const prisma = getPrismaForSchema(schema);
    const ctrl = new AnnouncementController(prisma);
    return ctrl.updateAnnouncement(request, reply);
  });

  fastify.delete("/:id", async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    const schema = getStoreSchema(request);
    const prisma = getPrismaForSchema(schema);
    const ctrl = new AnnouncementController(prisma);
    return ctrl.deleteAnnouncement(request, reply);
  });
}
