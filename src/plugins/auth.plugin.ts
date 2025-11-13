/* eslint-disable @typescript-eslint/no-unused-vars */
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import { AppError } from "@/utils";

export interface AuthenticatedRequest extends FastifyRequest {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

// Authentication plugin
async function authPlugin(fastify: FastifyInstance) {
  // Add authenticate decorator to fastify instance
  fastify.decorate("authenticate", async function authenticate(
    request: AuthenticatedRequest,
    reply: FastifyReply
  ) {
    try {
      // Verify JWT token
      await request.jwtVerify();
      
      // The decoded token is available in request.user
      // Add user data to request object
      request.user = {
        userId: request.user.userId,
        email: request.user.email,
        role: request.user.role
      };
    } catch (error) {
      const appError: AppError = {
        code: "UNAUTHORIZED",
        message: "Authentication required",
        statusCode: 401
      };
      
      return reply
        .code(401)
        .send({
          success: false,
          error: {
            code: appError.code,
            message: appError.message
          }
        });
    }
  });

  // Add optional authentication decorator
  fastify.decorate("authenticateOptional", async function authenticateOptional(
    request: AuthenticatedRequest,
    reply: FastifyReply
  ) {
    try {
      // Try to verify JWT token, but don't fail if no token provided
      if (request.headers.authorization) {
        await request.jwtVerify();
        request.user = {
          userId: request.user.userId,
          email: request.user.email,
          role: request.user.role
        };
      }
    } catch (error) {
      // If token is provided but invalid, still return error
      if (request.headers.authorization) {
        const appError: AppError = {
          code: "INVALID_TOKEN",
          message: "Invalid authentication token",
          statusCode: 401
        };
        
        return reply
          .code(401)
          .send({
            success: false,
            error: {
              code: appError.code,
              message: appError.message
            }
          });
      }
      // If no token provided, continue without authentication
    }
  });
}

export default fp(authPlugin, {
  name: "auth-plugin"
});