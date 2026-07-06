import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { ChatRequestSchema } from "../schemas/chat";
import type { UIMessage } from "ai";
import { PaginationQuerySchema, CreateChatSessionRequestSchema } from "@intentctrl-cloud/types";
import { handleChat } from "../services/llm";
import { getPaginatedSessions, findSessionById, createSession, deleteSession } from "../services/chat-session";

export default async function chatRoute(fastify: FastifyInstance) {
  fastify.post("/chat/sessions", async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = CreateChatSessionRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.fail(400, "Validation failed");
      return;
    }

    const session = await createSession(fastify.db, parsed.data);
    reply.success(session);
  });

  fastify.post("/chat/:sessionId", async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = ChatRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.fail(400, "Validation failed", {
        details: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      });
      return;
    }

    const { sessionId } = request.params as { sessionId: string };
    if (!sessionId) {
      reply.fail(400, "Missing sessionId");
      return;
    }

    try {
      reply.header("Content-Type", "text/plain; charset=utf-8");
      reply.hijack();

      const origin = request.headers.origin;
      if (origin) {
        reply.raw.setHeader("Access-Control-Allow-Origin", origin);
        reply.raw.setHeader("Access-Control-Allow-Credentials", "true");
      }

      await handleChat(fastify.db, sessionId, parsed.data, reply.raw);
    } catch (err) {
      request.log.error({ err }, "LLM request failed");
      if (!reply.sent) {
        reply.fail(502, "LLM request failed");
      }
    }
  });

  fastify.get("/chat/sessions", async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = PaginationQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      reply.fail(400, "Invalid pagination parameters");
      return;
    }

    const result = await getPaginatedSessions(fastify.db, parsed.data);
    reply.success(result);
  });

  fastify.get("/chat/sessions/visitor/:visitorId", async (request: FastifyRequest, reply: FastifyReply) => {
    const { visitorId } = request.params as { visitorId: string };

    const parsed = PaginationQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      reply.fail(400, "Invalid pagination parameters");
      return;
    }

    const result = await getPaginatedSessions(fastify.db, {
      ...parsed.data,
      columnFilters: [
        ...parsed.data.columnFilters,
        { id: "visitorId", value: visitorId },
        { id: "active", value: "true" },
      ],
    });
    reply.success(result);
  });

  fastify.get("/chat/sessions/:sessionId", async (request: FastifyRequest, reply: FastifyReply) => {
    const { sessionId } = request.params as { sessionId: string };

    const result = await findSessionById(fastify.db, sessionId);
    if (!result) {
      reply.fail(404, "Chat session not found");
      return;
    }

    reply.success(result);
  });

  fastify.get("/chat/sessions/:sessionId/messages/:visitorId", async (request: FastifyRequest, reply: FastifyReply) => {
    const { sessionId, visitorId } = request.params as { sessionId: string; visitorId: string };

    const result = await findSessionById(fastify.db, sessionId);
    if (!result) {
      reply.fail(404, "Chat session not found");
      return;
    }
    if (result.session.visitorId !== visitorId) {
      reply.fail(403, "Visitor mismatch");
      return;
    }

    reply.success(
      result.messages.map((m) => ({
        id: m.id,
        role: m.role,
        parts: m.parts as UIMessage["parts"],
        metadata: m.metadata ?? undefined,
      })) as UIMessage[],
    );
  });

  fastify.get("/chat/sessions/:sessionId/messages", async (request: FastifyRequest, reply: FastifyReply) => {
    const { sessionId } = request.params as { sessionId: string };

    const result = await findSessionById(fastify.db, sessionId);
    if (!result) {
      reply.fail(404, "Chat session not found");
      return;
    }

    reply.success(
      result.messages.map((m) => ({
        id: m.id,
        role: m.role,
        parts: m.parts as UIMessage["parts"],
        metadata: m.metadata ?? undefined,
      })) as UIMessage[],
    );
  });

  fastify.delete("/chat/sessions/:sessionId", async (request: FastifyRequest, reply: FastifyReply) => {
    const { sessionId } = request.params as { sessionId: string };

    const result = await findSessionById(fastify.db, sessionId);
    if (!result) {
      reply.fail(404, "Chat session not found");
      return;
    }

    await deleteSession(fastify.db, sessionId);
    reply.success(null, "Chat session deleted");
  });
}
