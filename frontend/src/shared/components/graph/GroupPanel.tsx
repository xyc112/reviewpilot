import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface GroupPanelProps {
  title: string;
  children: ReactNode;
  initiallyExpanded?: boolean;
  showCount?: boolean;
  count?: number;
}

const GroupPanel = ({
  title,
  children,
  initiallyExpanded = true,
  showCount = false,
  count = 0,
}: GroupPanelProps) => {
  const [expanded, setExpanded] = useState(initiallyExpanded);

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3">
      <button
        type="button"
        onClick={() => {
          setExpanded(!expanded);
        }}
        className="flex w-full cursor-pointer items-center justify-between rounded-lg py-1 text-left font-medium text-foreground hover:bg-muted/50"
      >
        <h3 className="m-0 text-sm">
          {title}
          {showCount ? (
            <span className="ml-1 text-muted-foreground">({count})</span>
          ) : null}
        </h3>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            !expanded && "-rotate-90",
          )}
          aria-hidden
        />
      </button>
      {expanded ? <div className="mt-2">{children}</div> : null}
    </div>
  );
};

export default GroupPanel;
