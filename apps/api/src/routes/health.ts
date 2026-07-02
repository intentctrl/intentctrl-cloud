import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

export default async function healthRoute(fastify: FastifyInstance) {
  fastify.get("/health", async (_request: FastifyRequest, reply: FastifyReply) => {
    reply.success({ status: "ok" });
  });
}
