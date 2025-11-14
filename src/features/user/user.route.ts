import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { UserController } from "./user.controller";
import { getPrismaPublic } from "../../../packages/libs/db/getPrismaForSchema";
import { UpdateUserProfileBody, UpdatePasswordBody } from "./user.interface";
import { AuthenticatedRequest } from "../auth/auth.interface";

export default async function userRoutes(fastify: FastifyInstance) {
  const prisma = getPrismaPublic();
  const userController = new UserController(prisma);

  // Add authentication hook for all routes in this plugin
  fastify.addHook("preHandler", async (request, reply) => {
    // Skip authentication for non-authenticated routes (if any)
    // All routes in this file require authentication
    await fastify.authenticate(request as AuthenticatedRequest, reply);
  });

  // GET /api/user/profile - Get user profile (requires authentication)
  fastify.get(
    "/profile",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return userController.getUserProfile(
        request as AuthenticatedRequest,
        reply
      );
    }
  );

  // PUT /api/user/profile - Update user profile (requires authentication)
  fastify.put(
    "/profile",
    async (
      request: FastifyRequest<{ Body: UpdateUserProfileBody }>,
      reply: FastifyReply
    ) => {
      return userController.updateUserProfile(
        request as AuthenticatedRequest<{ Body: UpdateUserProfileBody }>,
        reply
      );
    }
  );

  // PUT /api/user/password - Update password (requires authentication)
  fastify.put(
    "/password",
    async (
      request: FastifyRequest<{ Body: UpdatePasswordBody }>,
      reply: FastifyReply
    ) => {
      return userController.updatePassword(
        request as AuthenticatedRequest<{ Body: UpdatePasswordBody }>,
        reply
      );
    }
  );
}
