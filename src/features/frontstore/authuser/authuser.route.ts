import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { FrontstoreAuthUserController } from "./authuser.controller";
import { getPrismaForSchema } from "../../../../packages/libs/db/getPrismaForSchema";
import type { AuthenticatedRequest } from "../../../plugins/auth.plugin";
import type { UpdateProfileBody, AddAddressBody } from "./authuser.schema";

export default async function frontstoreAuthUserRoutes(fastify: FastifyInstance) {
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
    "/me",
    {
      preHandler: [fastify.authenticate] as any,
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const storeSlug = String(request.headers["x-store"]);
      const prisma = getPrismaForSchema(storeSlug);
      const controller = new FrontstoreAuthUserController(prisma);
      return controller.getProfile(request as AuthenticatedRequest, reply);
    }
  );

  fastify.patch(
    "/me",
    {
      preHandler: [fastify.authenticate] as any,
    },
    async (request: FastifyRequest<{ Body: UpdateProfileBody }>, reply: FastifyReply) => {
      const storeSlug = String(request.headers["x-store"]);
      const prisma = getPrismaForSchema(storeSlug);
      const controller = new FrontstoreAuthUserController(prisma);
      return controller.updateProfile(request as AuthenticatedRequest<{ Body: UpdateProfileBody }>, reply);
    }
  );

  fastify.post(
    "/me/addresses",
    {
      preHandler: [fastify.authenticate] as any,
    },
    async (request: FastifyRequest<{ Body: AddAddressBody }>, reply: FastifyReply) => {
      const storeSlug = String(request.headers["x-store"]);
      const prisma = getPrismaForSchema(storeSlug);
      const controller = new FrontstoreAuthUserController(prisma);
      return controller.addAddress(request as AuthenticatedRequest<{ Body: AddAddressBody }>, reply);
    }
  );
}
