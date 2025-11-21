import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { OrdersController } from "./orders.controller";
import { AuthenticatedRequest } from "../../../plugins/auth.plugin";
import { getPrismaForSchema } from "../../../../packages/libs/db/getPrismaForSchema";
import { GetOrdersQuery } from "./orders.schema";

export default async function ordersRoutes(fastify: FastifyInstance) {
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
    async (
      request: FastifyRequest<{ Querystring: GetOrdersQuery }>,
      reply: FastifyReply
    ) => {
      const storeSchema = getStoreSchema(request);
      const prisma = getPrismaForSchema(storeSchema);
      const controller = new OrdersController(prisma);
      return controller.getOrders(request, reply);
    }
  );

  fastify.get(
    "/:id",
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const storeSchema = getStoreSchema(request);
      const prisma = getPrismaForSchema(storeSchema);
      const controller = new OrdersController(prisma);
      return controller.getOrderById(request, reply);
    }
  );
}