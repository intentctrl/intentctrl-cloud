import {
  streamText,
  tool,
  jsonSchema,
  convertToModelMessages,
  toUIMessageStream,
  pipeUIMessageStreamToResponse,
  generateId,
} from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { ServerResponse } from "node:http";
import type { ChatRequest } from "../schemas/chat";
import type { DB } from "@intentctrl-cloud/db";
import { upsertMessage } from "./chat-session";

const LLM_BASE_URL = process.env.LLM_BASE_URL ?? "http://localhost:11434/v1";
const LLM_MODEL = process.env.LLM_MODEL ?? "gpt-4o-mini";
const LLM_API_KEY = process.env.LLM_API_KEY ?? "sk-local";

const openaiCompatibleProvider = createOpenAICompatible({
  name: "Any",
  apiKey: LLM_API_KEY,
  baseURL: LLM_BASE_URL,
  includeUsage: true,
});

function buildSystemPrompt(
  pageContent: string,
  dataContext: Record<string, unknown>,
  permissions: Record<string, boolean>,
): string {
  return `You are an AI assistant embedded in a web application.

${pageContent}

Application data: ${JSON.stringify(dataContext)}

Permissions (opt-out, false = denied):
${JSON.stringify(permissions)}

Prefer dedicated tools over other browser (click, navigate, highlight) tools for performing action.
When a tool execution is denied by the user, accept the denial and do not retry same action.

You can use the provided tools to interact with the page.`;
}

function toAiTools(tools: any[]) {
  if (tools.length === 0) return undefined;

  return Object.fromEntries(
    tools.map((t: any) => [
      t.id,
      tool({
        description: t.description,
        inputSchema: jsonSchema(t.inputSchema),
      }),
    ]),
  );
}

export async function handleChat(db: DB, sessionId: string, data: ChatRequest, response: ServerResponse) {
  const { message, pageContent, tools, dataContext = {}, permissions = {} } = data;

  const systemPrompt = buildSystemPrompt(pageContent, dataContext, permissions);
  const aiTools = toAiTools(tools);

  const allMessages = await upsertMessage(db, sessionId, message);

  const modelMessages = await convertToModelMessages(allMessages, {
    ignoreIncompleteToolCalls: true,
  });

  const toolApproval = Object.fromEntries(
    tools.filter((t: any) => t.needsApproval).map((t: any) => [t.id, "user-approval"] as const),
  );

  const result = streamText({
    model: openaiCompatibleProvider.chatModel(LLM_MODEL),
    instructions: systemPrompt,
    messages: modelMessages,
    tools: aiTools,
    toolApproval,
  });

  const uiStream = toUIMessageStream({
    stream: result.stream,
    generateMessageId: generateId,
    originalMessages: allMessages,
    onEnd: ({ responseMessage }) => {
      upsertMessage(db, sessionId, responseMessage);
    },
    onError: (error) => {
      console.error("stream error", error);
      return "Error streaming response";
    },
  });

  pipeUIMessageStreamToResponse({
    stream: uiStream,
    response,
  });
}
