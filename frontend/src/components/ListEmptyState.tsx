import { SearchOutlined } from "@ant-design/icons";
import type { ReactNode } from "react";

export interface ListEmptyStateProps {
  /** 空状态类型：无数据 / 筛选无结果 */
  variant: "empty" | "noResults";
  /** 图标，如 <BookOutlined className="text-[64px] text-stone-300" /> */
  icon?: ReactNode;
  /** 无结果时的默认图标（未传 icon 且 variant=noResults 时使用） */
  defaultNoResultsIcon?: ReactNode;
  /** 主描述，支持字符串或 ReactNode（如 Space 包多行） */
  description: ReactNode;
  /** 主操作（如「创建笔记」按钮），用于 variant=empty */
  action?: ReactNode;
  /** 清除筛选回调，variant=noResults 时显示「清除搜索」类按钮 */
  onClearFilter?: () => void;
  /** 清除按钮文案，默认「清除搜索」 */
  clearFilterLabel?: string;
}

const DEFAULT_NO_RESULTS_ICON = (
  <SearchOutlined className="text-[64px] text-stone-300 dark:text-stone-600" />
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
      <button
        type="button"
        onClick={onClearFilter}
        className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 hover:shadow-md dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        {clearFilterLabel}
      </button>
    ) : null;

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 py-16 dark:border-neutral-700 dark:bg-neutral-900/30">
      {resolvedIcon ? (
        <div className="mb-5 flex justify-center text-stone-400 dark:text-stone-500">
          {resolvedIcon}
        </div>
      ) : null}
      <div className="max-w-sm text-center text-base text-stone-600 dark:text-stone-400">
        {description}
      </div>
      {mainAction ? <div className="mt-6">{mainAction}</div> : null}
    </div>
  );
};

export default ListEmptyState;
