import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/shared/components/ui/button";

export interface FilterBarProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  clearLabel?: string;
  extra?: ReactNode;
  resultSummary?: ReactNode;
}

const FilterBar = ({
  hasActiveFilters,
  onClearFilters,
  clearLabel = "清除筛选",
  extra,
  resultSummary,
}: FilterBarProps) => {
  if (!hasActiveFilters && !extra) return null;

  return (
    <div className="flex w-full flex-col gap-3 rounded-2xl border border-border/80 bg-card/70 p-4">
      {hasActiveFilters ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="w-fit"
        >
          <X className="size-4" />
          {clearLabel}
        </Button>
      ) : null}
      {extra}
      {hasActiveFilters && resultSummary ? (
        <span className="text-sm text-muted-foreground">{resultSummary}</span>
      ) : null}
    </div>
  );
};

export default FilterBar;
