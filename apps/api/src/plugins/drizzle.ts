import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { createClient, type DB } from "@intentctrl-cloud/db/client";

export default fp(
  async function drizzlePlugin(fastify: FastifyInstance) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) throw new Error("DATABASE_URL is required — pass it or set the DATABASE_URL env var");

    const { db, pool } = createClient(databaseUrl);

    fastify.decorate("db", db);

    fastify.addHook("onClose", async () => {
      await pool.end();
    });
  },
  { name: "drizzle-plugin" },
);

declare module "fastify" {
  interface FastifyInstance {
    db: DB;
  }
}
