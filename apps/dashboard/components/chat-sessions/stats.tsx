import type { ChatSessionResponse } from "@intentctrl-cloud/types";

type ChatSessionsStatsProps = {
  sessions: ChatSessionResponse[];
};

export function ChatSessionsStats({ sessions }: ChatSessionsStatsProps) {
  const activeCount = sessions.filter((s) => s.active).length;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="rounded-lg border p-4">
        <p className="text-xs font-medium tracking-wide text-muted-foreground">Total Sessions</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{sessions.length}</p>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-xs font-medium tracking-wide text-muted-foreground">Active Sessions</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{activeCount}</p>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-xs font-medium tracking-wide text-muted-foreground">Sessions</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{sessions.length}</p>
      </div>
    </div>
  );
}
