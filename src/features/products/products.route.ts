import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { ProductController } from "./products.controller";
import { PrismaClient } from "@prisma/client";
import { GetProductsQuery } from "./products.interface";

export default async function productRoutes(fastify: FastifyInstance) {
  const prisma = new PrismaClient();
  const productController = new ProductController(prisma);

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
