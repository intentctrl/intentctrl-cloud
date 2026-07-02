import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Streamdown } from "streamdown";
import { Reasoning } from "@/components/elements/reasoning";
import { ToolCard } from "@/components/elements/tool-card";
import type { MessagePart, TextPart, ReasoningPart, ToolUIPart } from "@intentctrl-cloud/types";

type MessageBubbleProps = {
  role: string;
  parts: MessagePart[];
  createdAt?: string;
};

export function MessageBubble({ role, parts, createdAt }: MessageBubbleProps) {
  if (!parts || parts.length === 0) return null;

  const isUser = role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "px-4 py-2.5 text-sm",
          isUser ? "bg-primary text-primary-foreground max-w-[75%] min-w-0 rounded-lg" : "w-[75%]",
        )}
      >
        {parts.map((part, index) => {
          if (part.type === "text") {
            const textPart = part as TextPart;
            return (
              <Streamdown controls={false} key={index}>
                {textPart.text}
              </Streamdown>
            );
          }

          if (part.type === "reasoning") {
            const reasoningPart = part as ReasoningPart;
            return <Reasoning key={index} text={reasoningPart.text} />;
          }

          if (part.type.startsWith("tool-") || part.type === "dynamic-tool") {
            const toolPart = part as ToolUIPart;
            return <ToolCard key={toolPart.toolCallId} part={toolPart} />;
          }

          return null;
        })}
        {createdAt && (
          <p className={cn("mt-1 text-[10px]", isUser ? "text-primary-foreground/50" : "text-foreground/50")}>
            {format(createdAt, "HH:mm")}
          </p>
        )}
      </div>
    </div>
  );
}
