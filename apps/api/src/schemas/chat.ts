import z from "zod";
import type { UIMessage } from "ai";
import { RuntimePermissionsSchema, SerializedToolSchema } from "@intentctrl-cloud/types";

const MessageSchema = z.custom<UIMessage>();

export type Message = z.infer<typeof MessageSchema>;

export const ChatRequestSchema = z.object({
  message: MessageSchema,
  pageContent: z.string(),
  tools: z.array(SerializedToolSchema),
  dataContext: z.record(z.string(), z.unknown()).optional(),
  permissions: RuntimePermissionsSchema.optional(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;
