import { FastifyRequest, FastifyReply } from "fastify";
import { AuthService } from "./auth.service";
import {
  RegisterBody,
  LoginBody,
  ResetPasswordBody,
  ConfirmResetPasswordBody,
  RefreshTokenBody,
} from "./auth.interface";
import { ErrorHandler, ResponseHandler } from "../../../utils";
import { z, ZodError } from "zod";
import {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  confirmResetPasswordSchema,
  refreshTokenSchema,
} from "./auth.validation";
import { PublicPrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";

export class AuthController {
  private authService: AuthService;

  constructor(prisma: PublicPrismaClient) {
    this.authService = new AuthService(prisma);
  }

  private validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        throw ErrorHandler.validationError(
          "Validation failed",
          validationErrors
        );
      }
      throw error;
    }
  }

  async register(
    request: FastifyRequest<{ Body: RegisterBody }>,
    reply: FastifyReply
  ) {
    try {
      // Validate request body
      const validatedData = this.validateRequest<RegisterBody>(
        registerSchema,
        request.body
      );

      const result = await this.authService.register(validatedData);

      if ("error" in result) {
        return reply
          .code(result.error.statusCode)
          .send(ResponseHandler.error(result.error));
      }

      // Generate tokens using Fastify JWT
      const tokens = await this.authService.generateTokens(result.user.id);

      // Generate access token with JWT
      const accessToken = await reply.jwtSign({
        userId: result.user.id,
        email: result.user.email,
        currentStore: result.currentStore
          ? {
              id: result.currentStore.id,
              slug: result.currentStore.slug,
              role: result.currentStore.role,
            }
          : null,
      });

      return reply.code(201).send(
        ResponseHandler.success({
          user: result.user,
          tokens: {
            accessToken,
            refreshToken: tokens.refreshToken,
          },
        })
      );
    } catch (error) {
      request.log.error(error);
      const appError = ErrorHandler.handleUnknownError(error);
      return reply
        .code(appError.statusCode)
        .send(ResponseHandler.error(appError));
    }
  }

  async login(
    request: FastifyRequest<{ Body: LoginBody }>,
    reply: FastifyReply
  ) {
    try {
      const validatedData = this.validateRequest<LoginBody>(
        loginSchema,
        request.body
      );

      const result = await this.authService.login(validatedData);

      if ("error" in result) {
        return reply
          .code(result.error.statusCode)
          .send(ResponseHandler.error(result.error));
      }

      const tokens = await this.authService.generateTokens(result.user.id);

      const accessToken = await reply.jwtSign({
        userId: result.user.id,
        email: result.user.email,
        currentStore: result.currentStore
          ? {
              id: result.currentStore.id,
              slug: result.currentStore.slug,
              role: result.currentStore.role,
            }
          : null,
      });

      return reply.code(200).send(
        ResponseHandler.success({
          user: result.user,
          tokens: {
            accessToken,
            refreshToken: tokens.refreshToken,
          },
          currentStore: result.currentStore || null,
        })
      );
    } catch (error) {
      request.log.error(error);
      const appError = ErrorHandler.handleUnknownError(error);
      return reply
        .code(appError.statusCode)
        .send(ResponseHandler.error(appError));
    }
  }

  async resetPassword(
    request: FastifyRequest<{ Body: ResetPasswordBody }>,
    reply: FastifyReply
  ) {
    try {
      // Validate request body
      const validatedData = this.validateRequest<ResetPasswordBody>(
        resetPasswordSchema,
        request.body
      );

      const result = await this.authService.resetPassword(validatedData);

      if ("error" in result) {
        return reply
          .code(result.error.statusCode)
          .send(ResponseHandler.error(result.error));
      }

      return reply.code(200).send(
        ResponseHandler.success({
          message: "Password reset instructions sent to email",
        })
      );
    } catch (error) {
      request.log.error(error);
      const appError = ErrorHandler.handleUnknownError(error);
      return reply
        .code(appError.statusCode)
        .send(ResponseHandler.error(appError));
    }
  }

  async confirmResetPassword(
    request: FastifyRequest<{ Body: ConfirmResetPasswordBody }>,
    reply: FastifyReply
  ) {
    try {
      // Validate request body
      const validatedData = this.validateRequest<ConfirmResetPasswordBody>(
        confirmResetPasswordSchema,
        request.body
      );

      const result = await this.authService.confirmResetPassword(validatedData);

      if ("error" in result) {
        return reply
          .code(result.error.statusCode)
          .send(ResponseHandler.error(result.error));
      }

      return reply
        .code(200)
        .send(
          ResponseHandler.success({ message: "Password reset successful" })
        );
    } catch (error) {
      request.log.error(error);
      const appError = ErrorHandler.handleUnknownError(error);
      return reply
        .code(appError.statusCode)
        .send(ResponseHandler.error(appError));
    }
  }

  async refreshToken(
    request: FastifyRequest<{ Body: RefreshTokenBody }>,
    reply: FastifyReply
  ) {
    try {
      // Validate request body
      const validatedData = this.validateRequest<RefreshTokenBody>(
        refreshTokenSchema,
        request.body
      );

      const result = await this.authService.refreshToken(validatedData);

      if ("error" in result) {
        return reply
          .code(result.error.statusCode)
          .send(ResponseHandler.error(result.error));
      }

      // Generate new tokens using Fastify JWT
      const tokens = await this.authService.generateTokens(result.user.id);

      // Generate new access token with JWT
      const accessToken = await reply.jwtSign({
        userId: result.user.id,
        email: result.user.email,
        role: result.user.role,
      });

      return reply.code(200).send(
        ResponseHandler.success({
          user: result.user,
          tokens: {
            accessToken,
            refreshToken: tokens.refreshToken,
          },
        })
      );
    } catch (error) {
      request.log.error(error);
      const appError = ErrorHandler.handleUnknownError(error);
      return reply
        .code(appError.statusCode)
        .send(ResponseHandler.error(appError));
    }
  }

  async logout(userId: string, reply: FastifyReply) {
    try {
      const result = await this.authService.logout(userId);

      if ("error" in result) {
        return reply
          .code(result.error.statusCode)
          .send(ResponseHandler.error(result.error));
      }

      return reply.code(200).send(
        ResponseHandler.success({
          message: "Logout successful",
        })
      );
    } catch (error) {
      const appError = ErrorHandler.handleUnknownError(error);
      return reply
        .code(appError.statusCode)
        .send(ResponseHandler.error(appError));
    }
  }
}
