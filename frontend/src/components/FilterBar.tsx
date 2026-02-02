import { Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import type { ReactNode } from "react";

export interface FilterBarProps {
  /** 是否有生效的筛选（搜索、标签等） */
  hasActiveFilters: boolean;
  /** 清除所有筛选 */
  onClearFilters: () => void;
  /** 清除按钮文案，默认「清除筛选」 */
  clearLabel?: string;
  /** 额外内容，如标签选择、筛选结果统计等 */
  extra?: ReactNode;
  /** 筛选结果统计，如 "找到 3 个课程（共 10 个）" */
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
    <div className="flex w-full flex-col gap-3 rounded-xl border border-stone-200/80 bg-stone-50/50 p-4 dark:border-neutral-700/80 dark:bg-neutral-900/50">
      {hasActiveFilters ? (
        <Button
          onClick={onClearFilters}
          icon={<CloseOutlined />}
          className="w-fit rounded-xl border-stone-300 text-stone-600 hover:!border-stone-400 hover:!text-stone-800 dark:border-neutral-600 dark:text-stone-400 dark:hover:!border-neutral-500 dark:hover:!text-stone-200"
        >
          {clearLabel}
        </Button>
      ) : null}
      {extra}
      {hasActiveFilters && resultSummary ? (
        <span className="text-sm text-stone-500 dark:text-stone-400">
          {resultSummary}
        </span>
      ) : null}
    </div>
  );
};

export default FilterBar;
