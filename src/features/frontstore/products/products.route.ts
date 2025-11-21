import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { FrontstoreProductController } from "./products.controller";
import { getPrismaForSchema, getPrismaPublic } from "../../../../packages/libs/db/getPrismaForSchema";
import type { GetProductsQuery } from "./products.schema";

export default async function frontstoreProductRoutes(fastify: FastifyInstance) {
  fastify.addHook(
    "preHandler",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const storeHeader = request.headers["x-store"];
      if (!storeHeader || typeof storeHeader !== "string" || storeHeader.trim() === "") {
        return reply
          .code(400)
          .send({ success: false, data: [], message: "x-store header is required" });
      }
      const publicPrisma = getPrismaPublic();
      const store = await publicPrisma.store.findUnique({ where: { slug: storeHeader } });
      if (!store || (store as any).isActive === false) {
        return reply
          .code(400)
          .send({ success: false, data: [], message: "Invalid store" });
      }
    }
  );

  fastify.get(
    "/",
    async (
      request: FastifyRequest<{ Querystring: GetProductsQuery }>,
      reply: FastifyReply
    ) => {
      const storeSlug = String(request.headers["x-store"]);
      const prisma = getPrismaForSchema(storeSlug);
      const controller = new FrontstoreProductController(prisma);
      return controller.getProducts(request, reply);
    }
  );
}