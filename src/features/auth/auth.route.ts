import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { AuthController } from "./auth.controller";
import { getPrismaPublic } from "../../../packages/libs/db/getPrismaForSchema";
import {
  RegisterBody,
  LoginBody,
  ResetPasswordBody,
  ConfirmResetPasswordBody,
  RefreshTokenBody,
  AuthenticatedRequest,
} from "./auth.interface";

export default async function authRoutes(fastify: FastifyInstance) {
  const prisma = getPrismaPublic();
  const authController = new AuthController(prisma);

  // POST /api/auth/register - Register new user
  fastify.post(
    "/register",
    async (
      request: FastifyRequest<{ Body: RegisterBody }>,
      reply: FastifyReply
    ) => {
      return authController.register(request, reply);
    }
  );

  // POST /api/auth/login - Login user
  fastify.post(
    "/login",
    async (
      request: FastifyRequest<{ Body: LoginBody }>,
      reply: FastifyReply
    ) => {
      return authController.login(request, reply);
    }
  );

  // POST /api/auth/reset-password - Request password reset
  fastify.post(
    "/reset-password",
    async (
      request: FastifyRequest<{ Body: ResetPasswordBody }>,
      reply: FastifyReply
    ) => {
      return authController.resetPassword(request, reply);
    }
  );

  // POST /api/auth/confirm-reset-password - Confirm password reset
  fastify.post(
    "/confirm-reset-password",
    async (
      request: FastifyRequest<{ Body: ConfirmResetPasswordBody }>,
      reply: FastifyReply
    ) => {
      return authController.confirmResetPassword(request, reply);
    }
  );

  // POST /api/auth/refresh-token - Refresh access token
  fastify.post(
    "/refresh-token",
    async (
      request: FastifyRequest<{ Body: RefreshTokenBody }>,
      reply: FastifyReply
    ) => {
      return authController.refreshToken(request, reply);
    }
  );

  // DELETE /api/auth/logout - Logout user (requires authentication)
  fastify.delete(
    "/logout",
    {
      preHandler: async (request, reply) => {
        await fastify.authenticate(request as AuthenticatedRequest, reply);
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const authenticatedRequest = request as AuthenticatedRequest;
      return authController.logout(authenticatedRequest.user.userId, reply);
    }
  );
}
