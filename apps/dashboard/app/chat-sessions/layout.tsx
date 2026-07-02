import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat Sessions",
  description: "Browse your chat sessions.",
};

export default function ChatSessionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
