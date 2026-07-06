import z from "zod";
import { createPaginatedResponseSchema } from "./common";

export const CreateChatSessionRequestSchema = z.object({
  visitorId: z.string().min(1),
  externalUserId: z.string().optional(),
});

export type CreateChatSessionRequest = z.infer<typeof CreateChatSessionRequestSchema>;

export const ChatSessionResponseSchema = z.object({
  id: z.string(),
  externalUserId: z.string().nullable(),
  visitorId: z.string(),
  active: z.boolean(),
  title: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ChatSessionResponse = z.infer<typeof ChatSessionResponseSchema>;

export const ChatMessageResponseSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  role: z.string(),
  parts: z.unknown(),
  metadata: z.unknown().nullable(),
  createdAt: z.string(),
});

export type ChatMessageResponse = z.infer<typeof ChatMessageResponseSchema>;

export const DetailedChatSessionResponseSchema = z.object({
  session: ChatSessionResponseSchema,
  messages: z.array(ChatMessageResponseSchema),
});

export type DetailedChatSessionResponse = z.infer<typeof DetailedChatSessionResponseSchema>;

export type TextPart = {
  type: "text";
  text: string;
};

export type ReasoningPart = {
  type: "reasoning";
  text: string;
};

export type ToolUIPart = {
  type: string;
  toolCallId: string;
  state:
    "running" | "approval-requested" | "output-available" | "output-error" | "output-denied" | "approval-responded";
  toolName?: string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
};

export type MessagePart = TextPart | ReasoningPart | ToolUIPart;

export const PaginatedChatSessionsResponseSchema = createPaginatedResponseSchema(ChatSessionResponseSchema);

export type PaginatedChatSessionsResponse = z.infer<typeof PaginatedChatSessionsResponseSchema>;
