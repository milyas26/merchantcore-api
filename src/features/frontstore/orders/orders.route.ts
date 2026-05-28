import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { FrontstoreOrderController } from "./orders.controller";
import { getPrismaForSchema } from "../../../../packages/libs/db/getPrismaForSchema";
import type { AuthenticatedRequest } from "../../../plugins/auth.plugin";
import type { CreateOrderBody } from "./orders.schema";

export default async function frontstoreOrderRoutes(fastify: FastifyInstance) {
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
    {
      preHandler: [fastify.authenticate] as any,
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const storeSlug = String(request.headers["x-store"]);
      const prisma = getPrismaForSchema(storeSlug);
      const controller = new FrontstoreOrderController(prisma);
      return controller.getOrders(request as AuthenticatedRequest, reply);
    }
  );

  fastify.post(
    "/checkout",
    {
      preHandler: [fastify.authenticate] as any,
    },
    async (
      request: FastifyRequest<{ Body: CreateOrderBody & { cartId: string } }>,
      reply: FastifyReply
    ) => {
      const storeSlug = String(request.headers["x-store"]);
      const prisma = getPrismaForSchema(storeSlug);
      const controller = new FrontstoreOrderController(prisma);
      return controller.checkout(
        request as AuthenticatedRequest<{ Body: CreateOrderBody & { cartId: string } }>,
        reply
      );
    }
  );

  fastify.get(
    "/:id",
    {
      preHandler: [fastify.authenticate] as any,
    },
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const storeSlug = String(request.headers["x-store"]);
      const prisma = getPrismaForSchema(storeSlug);
      const controller = new FrontstoreOrderController(prisma);
      return controller.getOrder(request as AuthenticatedRequest<{ Params: { id: string } }>, reply);
    }
  );
}
