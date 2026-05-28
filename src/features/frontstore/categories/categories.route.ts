import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { FrontstoreCategoryController } from "./categories.controller";
import { getPrismaForSchema } from "../../../../packages/libs/db/getPrismaForSchema";
import type { GetCategoriesQuery } from "./categories.schema";

export default async function frontstoreCategoryRoutes(fastify: FastifyInstance) {
  fastify.addHook(
    "preHandler",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const storeHeader = request.headers["x-store"];
      if (!storeHeader || typeof storeHeader !== "string" || storeHeader.trim() === "") {
        return reply
          .code(400)
          .send({ success: false, data: [], message: "x-store header is required" });
      }
    }
  );

  fastify.get(
    "/",
    async (
      request: FastifyRequest<{ Querystring: GetCategoriesQuery }>,
      reply: FastifyReply
    ) => {
      const storeSlug = String(request.headers["x-store"]);
      const prisma = getPrismaForSchema(storeSlug);
      const controller = new FrontstoreCategoryController(prisma);
      return controller.getCategories(request, reply);
    }
  );

  fastify.get(
    "/:slug",
    async (
      request: FastifyRequest<{ Params: { slug: string } }>,
      reply: FastifyReply
    ) => {
      const storeSlug = String(request.headers["x-store"]);
      const prisma = getPrismaForSchema(storeSlug);
      const controller = new FrontstoreCategoryController(prisma);
      return controller.getCategoryBySlug(request, reply);
    }
  );
}
