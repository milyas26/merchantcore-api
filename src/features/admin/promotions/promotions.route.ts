import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { PromotionController } from "./promotions.controller";
import type { GetPromotionsQuery, CreatePromotionRequest, UpdatePromotionRequest } from "./promotions.schema";
import type { AuthenticatedRequest } from "../../../plugins/auth.plugin";
import { getPrismaForSchema } from "../../../../packages/libs/db/getPrismaForSchema";

export default async function promotionRoutes(fastify: FastifyInstance) {
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
    request: FastifyRequest<{ Querystring: GetPromotionsQuery }>,
    reply: FastifyReply
  ) => {
    const schema = getStoreSchema(request);
    const prisma = getPrismaForSchema(schema);
    const ctrl = new PromotionController(prisma);
    return ctrl.getPromotions(request, reply);
  });

  fastify.get("/:id", async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    const schema = getStoreSchema(request);
    const prisma = getPrismaForSchema(schema);
    const ctrl = new PromotionController(prisma);
    return ctrl.getPromotionById(request, reply);
  });

  fastify.post("/", async (
    request: FastifyRequest<{ Body: CreatePromotionRequest }>,
    reply: FastifyReply
  ) => {
    const schema = getStoreSchema(request);
    const prisma = getPrismaForSchema(schema);
    const ctrl = new PromotionController(prisma);
    return ctrl.createPromotion(request, reply);
  });

  fastify.put("/:id", async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdatePromotionRequest }>,
    reply: FastifyReply
  ) => {
    const schema = getStoreSchema(request);
    const prisma = getPrismaForSchema(schema);
    const ctrl = new PromotionController(prisma);
    return ctrl.updatePromotion(request, reply);
  });

  fastify.delete("/:id", async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    const schema = getStoreSchema(request);
    const prisma = getPrismaForSchema(schema);
    const ctrl = new PromotionController(prisma);
    return ctrl.deletePromotion(request, reply);
  });
}
