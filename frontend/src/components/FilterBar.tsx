import { Button, Space, Typography } from "antd";
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
    <Space orientation="vertical" size="middle" className="w-full">
      {hasActiveFilters ? (
        <Button onClick={onClearFilters} icon={<CloseOutlined />}>
          {clearLabel}
        </Button>
      ) : null}
      {extra}
      {hasActiveFilters && resultSummary ? (
        <Typography.Text type="secondary">{resultSummary}</Typography.Text>
      ) : null}
    </Space>
  );
};

export default FilterBar;
