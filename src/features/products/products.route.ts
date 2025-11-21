import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { ProductController } from "./products.controller";
import { GetProductsQuery, UpsertProductRequest } from "./products.interface";
import { AuthenticatedRequest } from "../../plugins/auth.plugin";
import { getPrismaForSchema } from "../../../packages/libs/db/getPrismaForSchema";

export default async function productRoutes(fastify: FastifyInstance) {
  // Helper function to get store schema from request context
  const getStoreSchema = (request: FastifyRequest): string => {
    const authenticatedRequest = request as AuthenticatedRequest;
    const currentStore = authenticatedRequest.user?.currentStore;

    if (!currentStore?.slug) {
      throw new Error("No store selected. Please select a store first.");
    }

    return currentStore.slug;
  };

  // Add authentication hook to all routes in this fil
  fastify.addHook(
    "preHandler",
    async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request as AuthenticatedRequest, reply);
    }
  );

  // GET /api/products - Get all products with pagination, search, and filtering
  fastify.get(
    "/",
    async (
      request: FastifyRequest<{ Querystring: GetProductsQuery }>,
      reply: FastifyReply
    ) => {
      const storeSchema = getStoreSchema(request);
      const prisma = getPrismaForSchema(storeSchema);
      const productController = new ProductController(prisma);
      return productController.getProducts(request, reply);
    }
  );

  // GET /api/products/:slug - Get product bu Slug
  fastify.get(
    "/:slug",
    async (
      request: FastifyRequest<{ Params: { slug: string } }>,
      reply: FastifyReply
    ) => {
      const storeSchema = getStoreSchema(request);
      const prisma = getPrismaForSchema(storeSchema);
      const productController = new ProductController(prisma);
      return productController.getProductBySlug(request, reply);
    }
  );

  // POST /api/products/check-stock - Check product stock availability
  fastify.post(
    "/check-stock",
    async (
      request: FastifyRequest<{
        Body: { variantId: string; quantity: number };
      }>,
      reply: FastifyReply
    ) => {
      const storeSchema = getStoreSchema(request);
      const prisma = getPrismaForSchema(storeSchema);
      const productController = new ProductController(prisma);
      return productController.checkStock(request, reply);
    }
  );

  // POST /api/products - Create or update product by payload id
  fastify.post(
    "/",
    async (
      request: FastifyRequest<{
        Body: UpsertProductRequest;
      }>,
      reply: FastifyReply
    ) => {
      const storeSchema = getStoreSchema(request);
      const prisma = getPrismaForSchema(storeSchema);
      const productController = new ProductController(prisma);
      return productController.upsertProduct(request, reply);
    }
  );
}
