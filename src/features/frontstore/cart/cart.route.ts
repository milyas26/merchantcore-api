import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { FrontstoreCartController } from "./cart.controller";
import { getPrismaForSchema } from "../../../../packages/libs/db/getPrismaForSchema";
import type { AuthenticatedRequest } from "../../../plugins/auth.plugin";
import type { AddCartItemBody, UpdateCartItemBody } from "./cart.schema";

export default async function frontstoreCartRoutes(fastify: FastifyInstance) {
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
      const controller = new FrontstoreCartController(prisma);
      return controller.getCart(request as AuthenticatedRequest, reply);
    }
  );

  fastify.post(
    "/items",
    {
      preHandler: [fastify.authenticate] as any,
    },
    async (request: FastifyRequest<{ Body: AddCartItemBody }>, reply: FastifyReply) => {
      const storeSlug = String(request.headers["x-store"]);
      const prisma = getPrismaForSchema(storeSlug);
      const controller = new FrontstoreCartController(prisma);
      return controller.addItem(request as AuthenticatedRequest<{ Body: AddCartItemBody }>, reply);
    }
  );

  fastify.patch(
    "/items/:id",
    {
      preHandler: [fastify.authenticate] as any,
    },
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: UpdateCartItemBody }>,
      reply: FastifyReply
    ) => {
      const storeSlug = String(request.headers["x-store"]);
      const prisma = getPrismaForSchema(storeSlug);
      const controller = new FrontstoreCartController(prisma);
      return controller.updateItem(
        request as AuthenticatedRequest<{ Params: { id: string }; Body: UpdateCartItemBody }>,
        reply
      );
    }
  );

  fastify.delete(
    "/items/:id",
    {
      preHandler: [fastify.authenticate] as any,
    },
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const storeSlug = String(request.headers["x-store"]);
      const prisma = getPrismaForSchema(storeSlug);
      const controller = new FrontstoreCartController(prisma);
      return controller.removeItem(
        request as AuthenticatedRequest<{ Params: { id: string } }>,
        reply
      );
    }
  );
}
