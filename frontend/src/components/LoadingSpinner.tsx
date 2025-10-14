import React from "react";
import { Spin } from "antd";
import { css } from "@emotion/react";

interface LoadingSpinnerProps {
  size?: "small" | "default" | "large";
  tip?: string;
  fullScreen?: boolean;
}

const spinnerStyles = {
  container: (fullScreen: boolean) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${fullScreen ? "100px" : "20px"};
    ${fullScreen &&
    `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      z-index: 9999;
    `}
  `,
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "default",
  tip = "加载中...",
  fullScreen = false,
}) => {
  return (
    <div css={spinnerStyles.container(fullScreen)}>
      <Spin size={size} tip={tip} />
    </div>
  );
};

export default LoadingSpinner;
