import { FastifyReply, FastifyRequest } from "fastify";
import { FrontstoreAuthService } from "./auth.service";
import type { LoginBody, RegisterBody } from "./auth.interface";
import { loginSchema, registerSchema } from "./auth.validation";
import { ErrorHandler, ResponseHandler } from "@/utils";
import { StorePrismaClient, getPrismaPublic } from "../../../../packages/libs/db/getPrismaForSchema";

export class FrontstoreAuthController {
  private service: FrontstoreAuthService;

  constructor(prisma: StorePrismaClient) {
    this.service = new FrontstoreAuthService(prisma);
  }

  async login(
    request: FastifyRequest<{ Body: LoginBody }>,
    reply: FastifyReply
  ) {
    try {
      const validated = loginSchema.parse(request.body);

      const result = await this.service.login(validated);

      if ("error" in result) {
        return reply
          .code(result.error.statusCode)
          .send(ResponseHandler.error(result.error));
      }

      const storeSlug = String(request.headers["x-store"] || "");
      const publicPrisma = getPrismaPublic();
      const store = await publicPrisma.store.findUnique({ where: { slug: storeSlug } });
      if (!store) {
        const appError = ErrorHandler.createError("INVALID_REQUEST", { reason: "Invalid store" });
        return reply.code(appError.statusCode).send(ResponseHandler.error(appError));
      }

      const accessToken = await reply.jwtSign({
        userId: result.user.id,
        email: result.user.email,
        role: result.user.role,
        currentStore: {
          id: store.id,
          slug: store.slug,
          role: "CUSTOMER",
        },
      });

      return reply.code(200).send(
        ResponseHandler.success({
          user: result.user,
          tokens: {
            accessToken,
            refreshToken: "",
          },
        })
      );
    } catch (error) {
      const appError = ErrorHandler.handleUnknownError(error);
      return reply
        .code(appError.statusCode)
        .send(ResponseHandler.error(appError));
    }
  }

  async register(
    request: FastifyRequest<{ Body: RegisterBody }>,
    reply: FastifyReply
  ) {
    try {
      const validated = registerSchema.parse(request.body);
      const result = await this.service.register(validated);

      if ("error" in result) {
        return reply
          .code(result.error.statusCode)
          .send(ResponseHandler.error(result.error));
      }

      return reply.code(201).send(
        ResponseHandler.success({
          user: result.user,
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