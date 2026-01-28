import React, { createContext, useContext, useEffect, useState } from "react";
import { ConfigProvider, theme as antdTheme } from "antd";
import type { ThemeConfig } from "antd";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // 从 localStorage 读取主题，默认为 light
    const savedTheme = localStorage.getItem("theme") as Theme;
    return savedTheme || "light";
  });

  useEffect(() => {
    // 应用主题到 document
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // Ant Design 主题配置
  const antdThemeConfig: ThemeConfig = {
    algorithm:
      theme === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      // 主色调 - 使用更现代的蓝色
      colorPrimary: "#1677ff",
      colorSuccess: "#52c41a",
      colorWarning: "#faad14",
      colorError: "#ff4d4f",
      colorInfo: "#1677ff",
      
      // 圆角
      borderRadius: 8,
      borderRadiusLG: 12,
      borderRadiusSM: 6,
      
      // 字体
      fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 'Roboto', 'Helvetica Neue', Arial, sans-serif`,
      fontSize: 14,
      fontSizeLG: 16,
      fontSizeSM: 12,
      
      // 间距
      padding: 16,
      paddingLG: 24,
      paddingSM: 12,
      paddingXS: 8,
      
      // 阴影
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
      boxShadowSecondary: "0 4px 12px rgba(0, 0, 0, 0.12)",
      
      // 边框
      lineWidth: 1,
      lineType: "solid",
      
      // 动画
      motionDurationFast: "0.1s",
      motionDurationMid: "0.2s",
      motionDurationSlow: "0.3s",
    },
    components: {
      Layout: {
        headerBg: theme === "dark" ? "#141414" : "#ffffff",
        bodyBg: theme === "dark" ? "#000000" : "#f5f5f5",
        siderBg: theme === "dark" ? "#141414" : "#ffffff",
      },
      Menu: {
        itemBorderRadius: 8,
        itemMarginInline: 4,
        itemMarginBlock: 4,
        itemHoverBg: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",
        itemSelectedBg: theme === "dark" ? "rgba(22, 119, 255, 0.2)" : "rgba(22, 119, 255, 0.1)",
        itemActiveBg: theme === "dark" ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.06)",
      },
      Card: {
        borderRadiusLG: 12,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
        paddingLG: 24,
      },
      Button: {
        borderRadius: 8,
        controlHeight: 40,
        controlHeightLG: 48,
        controlHeightSM: 32,
      },
      Input: {
        borderRadius: 8,
        controlHeight: 40,
        controlHeightLG: 48,
        controlHeightSM: 32,
      },
    },
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      <ConfigProvider theme={antdThemeConfig}>{children}</ConfigProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
