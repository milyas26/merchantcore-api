import type { FastifyRequest, FastifyReply } from "fastify";

declare module "fastify" {
  // menambahkan property authenticate ke FastifyInstance
  interface FastifyInstance {
    authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  }

  // optional: request.user yang di-populate oleh jwtVerify()
  interface FastifyRequest {
    user?: {
      userId: string;
      email: string;
      role: string;
    };
  }
}
