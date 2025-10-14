import React from "react";
import { Empty, Button } from "antd";
import { css } from "@emotion/react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

const emptyStyles = {
  container: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
  `,
  action: css`
    margin-top: 16px;
  `,
};

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "暂无数据",
  description = "当前没有可显示的内容",
  actionText,
  onAction,
}) => {
  return (
    <div css={emptyStyles.container}>
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div>
            <div style={{ fontSize: "16px", marginBottom: "8px" }}>{title}</div>
            <div style={{ color: "#999" }}>{description}</div>
          </div>
        }
      />
      {actionText && onAction && (
        <div css={emptyStyles.action}>
          <Button type="primary" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
