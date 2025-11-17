import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { CategoryController } from "./categories.controller";
import { GetCategoriesQuery, CreateCategoryRequest } from "./categories.interface";
import { AuthenticatedRequest } from "../../plugins/auth.plugin";
import { getPrismaForSchema } from "../../../packages/libs/db/getPrismaForSchema";

export default async function categoryRoutes(fastify: FastifyInstance) {
  // Helper function to get store schema from request context
  const getStoreSchema = (request: FastifyRequest): string => {
    const authenticatedRequest = request as AuthenticatedRequest;
    const currentStore = authenticatedRequest.user?.currentStore;

    if (!currentStore?.slug) {
      throw new Error("No store selected. Please select a store first.");
    }

    return currentStore.slug;
  };

  // Add authentication hook to all routes in this file
  fastify.addHook(
    "preHandler",
    async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request as AuthenticatedRequest, reply);
    }
  );

  // GET /api/categories - Get all categories with pagination, search, and filtering
  fastify.get(
    "/",
    async (
      request: FastifyRequest<{ Querystring: GetCategoriesQuery }>,
      reply: FastifyReply
    ) => {
      const storeSchema = getStoreSchema(request);
      const prisma = getPrismaForSchema(storeSchema);
      const categoryController = new CategoryController(prisma);
      return categoryController.getCategories(request, reply);
    }
  );

  // GET /api/categories/:id - Get category by ID
  fastify.get(
    "/:id",
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const storeSchema = getStoreSchema(request);
      const prisma = getPrismaForSchema(storeSchema);
      const categoryController = new CategoryController(prisma);
      return categoryController.getCategoryById(request, reply);
    }
  );

  // GET /api/categories/slug/:slug - Get category by slug
  fastify.get(
    "/slug/:slug",
    async (
      request: FastifyRequest<{ Params: { slug: string } }>,
      reply: FastifyReply
    ) => {
      const storeSchema = getStoreSchema(request);
      const prisma = getPrismaForSchema(storeSchema);
      const categoryController = new CategoryController(prisma);
      return categoryController.getCategoryBySlug(request, reply);
    }
  );

  // POST /api/categories - Create new category
  fastify.post(
    "/",
    async (
      request: FastifyRequest<{
        Body: CreateCategoryRequest;
      }>,
      reply: FastifyReply
    ) => {
      const storeSchema = getStoreSchema(request);
      const prisma = getPrismaForSchema(storeSchema);
      const categoryController = new CategoryController(prisma);
      return categoryController.createCategory(request, reply);
    }
  );
}