import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import fastifyCors from "@fastify/cors";

export default fp(async function corsPlugin(app: FastifyInstance) {
  await app.register(fastifyCors, {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
    credentials: true,
    maxAge: 86400,
  });
});
