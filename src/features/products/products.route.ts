import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { ProductController } from "./products.controller";
import { GetProductsQuery } from "./products.interface";
import { AuthenticatedRequest } from "../../plugins/auth.plugin";
import { runInSchema } from "../../utils/schemaRunner";

export default async function productRoutes(fastify: FastifyInstance) {
  // Helper function to get store schema from request context
  const getStoreSchema = (request: FastifyRequest): string => {
    const authenticatedRequest = request as AuthenticatedRequest;
    const currentStore = authenticatedRequest.user?.currentStore;
    return currentStore?.slug || "store_template";
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
      return runInSchema(storeSchema, async (tx) => {
        const productController = new ProductController(tx);
        return productController.getProducts(request, reply);
      });
    }
  );

  // GET /api/products/:id - Get product by ID
  fastify.get(
    "/:id",
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const storeSchema = getStoreSchema(request);
      return runInSchema(storeSchema, async (tx) => {
        const productController = new ProductController(tx);
        return productController.getProductById(request, reply);
      });
    }
  );

  // GET /api/products/slug/:slug - Get product by slug
  fastify.get(
    "/slug/:slug",
    async (
      request: FastifyRequest<{ Params: { slug: string } }>,
      reply: FastifyReply
    ) => {
      const storeSchema = getStoreSchema(request);
      return runInSchema(storeSchema, async (tx) => {
        const productController = new ProductController(tx);
        return productController.getProductBySlug(request, reply);
      });
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
      return runInSchema(storeSchema, async (tx) => {
        const productController = new ProductController(tx);
        return productController.checkStock(request, reply);
      });
    }
  );
}
