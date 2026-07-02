import Fastify, { type FastifyError, type FastifyRequest, type FastifyReply } from "fastify";
import corsPlugin from "./plugins/cors";
import responsePlugin from "./plugins/response";
import drizzlePlugin from "./plugins/drizzle";
import apiKeyPlugin from "./middleware/apiKey";
import healthRoute from "./routes/health";
import chatRoute from "./routes/chat";

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? "info",
      transport:
        process.env.NODE_ENV !== "production"
          ? {
              target: "pino-pretty",
              options: {
                colorize: true,
                translateTime: "HH:MM:ss",
                ignore: "pid,hostname",
              },
            }
          : undefined,
    },
  });

  await app.register(corsPlugin);
  await app.register(responsePlugin);
  await app.register(drizzlePlugin);

  app.addContentTypeParser("application/json", { parseAs: "string", bodyLimit: 1048576 }, (req, body, done) => {
    const raw = body as string;
    (req as any).rawBody = raw;
    if (!raw || raw.trim() === "") {
      done(null, {});
    } else {
      try {
        done(null, JSON.parse(raw));
      } catch (err) {
        done(err as Error, undefined);
      }
    }
  });

  app.setErrorHandler(async (error: Error | FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    request.log.error({ err: error }, "Unhandled error");
    const err = error as any;
    const statusCode = err.statusCode ?? err.status ?? 500;
    const message =
      error instanceof Error
        ? (err.message?.replace(/^\d+\s+/, "") ?? "Internal server error")
        : "Internal server error";
    reply.fail(statusCode, message);
  });

  await app.register(healthRoute, { prefix: "/api" });

  await app.register(
    async function (scoped) {
      await scoped.register(apiKeyPlugin);
      await scoped.register(chatRoute);
    },
    { prefix: "/api" },
  );

  return app;
}
