import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { ProductController } from "./products.controller";
import { getPrismaForSchema } from "../../../packages/libs/db/getPrismaForSchema";
import { GetProductsQuery } from "./products.interface";
import { AuthenticatedRequest } from "../../plugins/auth.plugin";

export default async function productRoutes(fastify: FastifyInstance) {
  // TODO: Make store schema dynamic based on request context (subdomain, header, etc.)
  // For now, using a placeholder store schema
  const storeSchema = "store_template";
  const prisma = getPrismaForSchema(storeSchema);
  const productController = new ProductController(prisma);

  // Add authentication hook to all routes in this file
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
      return productController.getProducts(request, reply);
    }
  );

  // GET /api/products/:id - Get product by ID
  fastify.get(
    "/:id",
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      return productController.getProductById(request, reply);
    }
  );

  // GET /api/products/slug/:slug - Get product by slug
  fastify.get(
    "/slug/:slug",
    async (
      request: FastifyRequest<{ Params: { slug: string } }>,
      reply: FastifyReply
    ) => {
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
      return productController.checkStock(request, reply);
    }
  );
}
