import { FastifyInstance } from "fastify";

export default async function healthRoute(fastify: FastifyInstance) {
  fastify.get("/health", async () => {
    return { status: "ok", time: Date.now() };
  });
}
