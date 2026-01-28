import { Empty, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ReactNode } from "react";

export interface ListEmptyStateProps {
  /** 空状态类型：无数据 / 筛选无结果 */
  variant: "empty" | "noResults";
  /** 图标，如 <BookOutlined style={{ fontSize: 64, color: '#d9d9d9' }} /> */
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
  <SearchOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />
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
    variant === "empty"
      ? action
      : showClear
        ? (
            <Button type="primary" onClick={onClearFilter}>
              {clearFilterLabel}
            </Button>
          )
        : null;

  return (
    <Empty image={resolvedIcon} description={description}>
      {mainAction}
    </Empty>
  );
};

export default ListEmptyState;
