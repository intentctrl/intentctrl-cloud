import { IconChevronDown } from "@tabler/icons-react";
import { Streamdown } from "streamdown";

type ReasoningProps = {
  text: string;
};

export function Reasoning({ text }: ReasoningProps) {
  return (
    <details className="group my-3 w-0 min-w-full overflow-hidden text-sm text-foreground/50">
      <summary className="cursor-pointer font-medium text-foreground/50 select-none list-none [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-1">
          <IconChevronDown size={14} className="transition-transform group-open:rotate-180" />
          Reasoning
        </span>
      </summary>
      <Streamdown controls={false} className="mt-2">
        {text}
      </Streamdown>
    </details>
  );
}
