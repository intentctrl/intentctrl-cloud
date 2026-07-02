import fp from "fastify-plugin";
import type { FastifyInstance, FastifyReply } from "fastify";

function sendSuccess<T>(reply: FastifyReply, data: T, message?: string) {
  return reply.code(200).send({
    status: 200,
    success: true,
    data,
    message: message ?? "OK",
  });
}

function sendFail<T = null>(reply: FastifyReply, status: number, message: string, data?: T) {
  return reply.code(status).send({
    status,
    success: false,
    data: data ?? null,
    message,
  });
}

export default fp(
  async function responsePlugin(fastify: FastifyInstance) {
    fastify.decorateReply("success", function <T>(this: FastifyReply, data: T, message?: string) {
      return sendSuccess(this, data, message);
    });

    fastify.decorateReply("fail", function <T = null>(this: FastifyReply, status: number, message: string, data?: T) {
      return sendFail(this, status, message, data);
    });
  },
  {
    name: "response-plugin",
  },
);

declare module "fastify" {
  interface FastifyReply {
    success: <T>(data: T, message?: string) => FastifyReply;
    fail: <T = null>(status: number, message: string, data?: T) => FastifyReply;
  }
}
