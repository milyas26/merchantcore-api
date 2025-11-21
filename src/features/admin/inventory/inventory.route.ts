import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { InventoryController } from "./inventory.controller";
import { type GetInventoriesQuery } from "./inventory.interface";
import { AuthenticatedRequest } from "../../../plugins/auth.plugin";
import { getPrismaForSchema } from "../../../../packages/libs/db/getPrismaForSchema";

export default async function inventoryRoutes(fastify: FastifyInstance) {
  const getStoreSchema = (request: FastifyRequest): string => {
    const authenticatedRequest = request as AuthenticatedRequest;
    const currentStore = authenticatedRequest.user?.currentStore;
    if (!currentStore?.slug) {
      throw new Error("No store selected. Please select a store first.");
    }
    return currentStore.slug;
  };

  fastify.addHook("preHandler", async (request: FastifyRequest, reply: FastifyReply) => {
    await fastify.authenticate(request as AuthenticatedRequest, reply);
  });

  fastify.get(
    "/",
    async (request: FastifyRequest<{ Querystring: GetInventoriesQuery }>, reply: FastifyReply) => {
      const storeSchema = getStoreSchema(request);
      const prisma = getPrismaForSchema(storeSchema);
      const inventoryController = new InventoryController(prisma);
      return inventoryController.getInventories(request, reply);
    }
  );

  fastify.put(
    "/:id",
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: { quantity: number; reserved: number } }>,
      reply: FastifyReply
    ) => {
      const storeSchema = getStoreSchema(request);
      const prisma = getPrismaForSchema(storeSchema);
      const inventoryController = new InventoryController(prisma);
      return inventoryController.updateInventory(request, reply);
    }
  );
}