import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { AuthController } from "./auth.controller";
import { PrismaClient } from "@prisma/client";
import { 
  RegisterBody, 
  LoginBody, 
  ResetPasswordBody, 
  ConfirmResetPasswordBody, 
  RefreshTokenBody 
} from "./auth.interface";

export default async function authRoutes(fastify: FastifyInstance) {
  const prisma = new PrismaClient();
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
}