import { Global, css } from "@emotion/react";
import React from "react";

export const GlobalStyles: React.FC = () => {
  return (
    <Global
      styles={css`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family:
            -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            "Helvetica Neue", Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        #root {
          min-height: 100vh;
        }

        /* 自定义滚动条 */
        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        .ant-layout {
          background: #f5f5f5;
        }

        .ant-layout-header {
          background: #fff;
          border-bottom: 1px solid #f0f0f0;
          padding: 0 24px;
        }

        .ant-layout-sider {
          background: #fff;
          border-right: 1px solid #f0f0f0;
        }

        .ant-menu {
          border-right: none;
        }
      `}
    />
  );
};
