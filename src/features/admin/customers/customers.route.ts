import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { CustomersController } from "./customers.controller";
import { AuthenticatedRequest } from "../../../plugins/auth.plugin";
import { getPrismaForSchema } from "../../../../packages/libs/db/getPrismaForSchema";
import { GetCustomersQuery } from "./customers.schema";

export default async function customersRoutes(fastify: FastifyInstance) {
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
      request: FastifyRequest<{ Querystring: GetCustomersQuery }>,
      reply: FastifyReply
    ) => {
      const storeSchema = getStoreSchema(request);
      const prisma = getPrismaForSchema(storeSchema);
      const controller = new CustomersController(prisma);
      return controller.getCustomers(request, reply);
    }
  );
}