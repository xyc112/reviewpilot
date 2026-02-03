import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/shared/components/ui/button";

export interface ListEmptyStateProps {
  variant: "empty" | "noResults";
  icon?: ReactNode;
  defaultNoResultsIcon?: ReactNode;
  description: ReactNode;
  action?: ReactNode;
  onClearFilter?: () => void;
  clearFilterLabel?: string;
}

const DEFAULT_NO_RESULTS_ICON = (
  <Search className="size-16 text-muted-foreground" />
);

const ListEmptyState = ({
  variant,
  icon,
  defaultNoResultsIcon = DEFAULT_NO_RESULTS_ICON,
  description,
  action,
  onClearFilter,
  clearFilterLabel = "清除搜索",
}: ListEmptyStateProps) => {
  const resolvedIcon =
    icon ?? (variant === "noResults" ? defaultNoResultsIcon : undefined);
  const showClear = variant === "noResults" && onClearFilter;
  const mainAction =
    variant === "empty" ? (
      action
    ) : showClear ? (
      <Button onClick={onClearFilter} size="default">
        {clearFilterLabel}
      </Button>
    ) : null;

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 py-16">
      {resolvedIcon ? (
        <div className="mb-5 flex justify-center text-muted-foreground">
          {resolvedIcon}
        </div>
      ) : null}
      <div className="max-w-sm text-center text-base text-muted-foreground">
        {description}
      </div>
      {mainAction ? <div className="mt-6">{mainAction}</div> : null}
    </div>
  );
};

export default ListEmptyState;
