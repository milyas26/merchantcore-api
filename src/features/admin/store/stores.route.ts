import { FastifyInstance } from "fastify";
import { StoresController } from "./stores.controller";
import { PublicPrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";
import { AuthenticatedRequest } from "../../../plugins/auth.plugin";
import { CreateStoreBody } from "./stores.interface";

export async function storesRoutes(fastify: FastifyInstance) {
  const prisma = new PublicPrismaClient();
  const storesController = new StoresController(prisma);

  fastify.get(
    "/stores",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      await storesController.getStores(request as AuthenticatedRequest, reply);
    }
  );

  fastify.post(
    "/stores",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      await storesController.createStore(
        request as AuthenticatedRequest<{ Body: CreateStoreBody }>,
        reply
      );
    }
  );

  // switch store
  fastify.post(
    "/stores/switch",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      await storesController.switchStore(
        request as AuthenticatedRequest<{ Body: { storeId: string } }>,
        reply
      );
    }
  );
}