import { Badge } from "@/components/ui/badge";
import { IconChevronDown } from "@tabler/icons-react";
import type { ToolUIPart } from "@intentctrl-cloud/types";

const STATE_LABELS: Record<string, string> = {
  running: "Running",
  "approval-requested": "Needs Approval",
  "output-available": "Completed",
  "output-error": "Error",
  "output-denied": "Denied",
  "approval-responded": "Completed",
};

type ToolCardProps = {
  part: ToolUIPart;
};

export function ToolCard({ part }: ToolCardProps) {
  const stateLabel = STATE_LABELS[part.state] ?? part.state;

  const stateVariant: "default" | "secondary" | "destructive" | "outline" =
    part.state === "output-available" || part.state === "approval-responded"
      ? "default"
      : part.state === "output-error" || part.state === "output-denied"
        ? "destructive"
        : "secondary";

  return (
    <details className="group my-3 w-0 min-w-full overflow-hidden rounded-lg border bg-card p-3">
      <summary className="flex cursor-pointer items-center justify-between gap-2 select-none list-none [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          <span>{part.toolName ?? part.type}</span>
          <IconChevronDown size={14} className="transition-transform group-open:rotate-180" />
        </span>
        <Badge className="rounded-sm" variant={stateVariant}>
          {stateLabel}
        </Badge>
      </summary>
      <div className="text-sm">
        {part.input != null && (
          <div>
            <pre className="mt-2 overflow-auto rounded bg-muted p-2 leading-relaxed text-muted-foreground">
              {JSON.stringify(part.input, null, 2) as string}
            </pre>
          </div>
        )}

        {(part.state === "output-available" || part.state === "approval-responded") && part.output != null && (
          <div className="pb-3">
            <pre className="mt-2 overflow-auto rounded bg-muted p-2 leading-relaxed text-muted-foreground">
              {JSON.stringify(part.output, null, 2) as string}
            </pre>
          </div>
        )}

        {part.state === "output-error" && part.errorText != null && (
          <div className="pb-3">
            <div className="mt-2 rounded bg-destructive/10 p-2 text-destructive">{part.errorText}</div>
          </div>
        )}
      </div>
    </details>
  );
}
