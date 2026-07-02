"use client";

import { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "@/components/elements/message-bubble";
import type { ChatMessageResponse, MessagePart } from "@intentctrl-cloud/types";

type ConversationViewProps = {
  messages: ChatMessageResponse[];
  isLoading?: boolean;
};

export function ConversationView({ messages, isLoading }: ConversationViewProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="space-y-4 px-4 py-4">
        {isLoading && (
          <div className="flex h-full items-center justify-center py-16">
            <span className="text-xs text-muted-foreground">Loading messages…</span>
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="flex h-full items-center justify-center py-16">
            <p className="text-center text-sm text-muted-foreground">No messages yet.</p>
          </div>
        )}

        {!isLoading &&
          messages.length > 0 &&
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              role={message.role}
              parts={(message.parts ?? []) as MessagePart[]}
              createdAt={message.createdAt}
            />
          ))}

        <div ref={endRef} />
      </div>
    </ScrollArea>
  );
}
