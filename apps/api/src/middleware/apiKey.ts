import fp from "fastify-plugin";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

export default fp(
  async function apiKeyPlugin(fastify: FastifyInstance) {
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      fastify.log.warn("API_KEY not set — running without authentication");
    }

    fastify.addHook("preHandler", async (request: FastifyRequest, reply: FastifyReply) => {
      if (!apiKey) {
        return;
      }

      const token = request.headers["x-api-key"] as string | undefined;
      if (!token || token !== apiKey) {
        reply.fail(401, "Unauthorized — provide a valid X-API-Key header");
        return;
      }
    });
  },
  {
    name: "api-key-plugin",
  },
);
