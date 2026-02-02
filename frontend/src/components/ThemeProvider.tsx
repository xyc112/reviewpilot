import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ConfigProvider, App, theme as antdTheme } from "antd";
import type { ThemeConfig } from "antd";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // 从 localStorage 读取主题，默认为 light
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark" || savedTheme === "light"
      ? savedTheme
      : "light";
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

      // 圆角 - 更现代化的圆角设计
      borderRadius: 8,
      borderRadiusLG: 12,
      borderRadiusSM: 6,
      borderRadiusXS: 4,

      // 字体 - 优化字体系统
      fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 'Roboto', 'Helvetica Neue', Arial, sans-serif`,
      fontSize: 14,
      fontSizeLG: 16,
      fontSizeSM: 12,
      fontSizeXL: 20,
      fontSizeHeading1: 38,
      fontSizeHeading2: 30,
      fontSizeHeading3: 24,
      fontSizeHeading4: 20,
      fontSizeHeading5: 16,

      // 间距 - 统一的间距系统
      padding: 16,
      paddingLG: 24,
      paddingSM: 12,
      paddingXS: 8,
      paddingXXS: 4,
      margin: 16,
      marginLG: 24,
      marginSM: 12,
      marginXS: 8,
      marginXXS: 4,

      // 阴影 - 更柔和的阴影系统
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
      boxShadowSecondary: "0 4px 12px rgba(0, 0, 0, 0.12)",
      boxShadowTertiary: "0 6px 16px rgba(0, 0, 0, 0.08)",

      // 边框
      lineWidth: 1,
      lineType: "solid",
      colorBorder:
        theme === "dark" ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.06)",
      colorBorderSecondary:
        theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",

      // 背景色
      colorBgContainer: theme === "dark" ? "#141414" : "#ffffff",
      colorBgElevated: theme === "dark" ? "#1f1f1f" : "#ffffff",
      colorBgLayout: theme === "dark" ? "#000000" : "#f5f5f5",
      colorBgSpotlight: theme === "dark" ? "#1f1f1f" : "#fafafa",

      // 文字颜色
      colorText:
        theme === "dark" ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.88)",
      colorTextSecondary:
        theme === "dark" ? "rgba(255, 255, 255, 0.65)" : "rgba(0, 0, 0, 0.65)",
      colorTextTertiary:
        theme === "dark" ? "rgba(255, 255, 255, 0.45)" : "rgba(0, 0, 0, 0.45)",

      // 动画 - 流畅的动画效果
      motionDurationFast: "0.1s",
      motionDurationMid: "0.2s",
      motionDurationSlow: "0.3s",
      motionEaseInOut: "cubic-bezier(0.645, 0.045, 0.355, 1)",
      motionEaseOut: "cubic-bezier(0.215, 0.61, 0.355, 1)",
      motionEaseIn: "cubic-bezier(0.55, 0.055, 0.675, 0.19)",
    },
    components: {
      Layout: {
        headerBg: theme === "dark" ? "#141414" : "#ffffff",
        headerHeight: 64,
        bodyBg: theme === "dark" ? "#000000" : "#f5f5f5",
        siderBg: theme === "dark" ? "#141414" : "#ffffff",
        triggerBg: theme === "dark" ? "#1f1f1f" : "#fafafa",
        triggerColor:
          theme === "dark"
            ? "rgba(255, 255, 255, 0.85)"
            : "rgba(0, 0, 0, 0.88)",
      },
      Menu: {
        itemBorderRadius: 8,
        itemMarginInline: 4,
        itemMarginBlock: 4,
        itemHoverBg:
          theme === "dark"
            ? "rgba(255, 255, 255, 0.08)"
            : "rgba(0, 0, 0, 0.04)",
        itemSelectedBg:
          theme === "dark"
            ? "rgba(22, 119, 255, 0.2)"
            : "rgba(22, 119, 255, 0.1)",
        itemActiveBg:
          theme === "dark"
            ? "rgba(255, 255, 255, 0.12)"
            : "rgba(0, 0, 0, 0.06)",
        subMenuItemBg: "transparent",
        itemColor:
          theme === "dark"
            ? "rgba(255, 255, 255, 0.85)"
            : "rgba(0, 0, 0, 0.88)",
      },
      Card: {
        borderRadiusLG: 12,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
        paddingLG: 24,
        headerBg: theme === "dark" ? "#1f1f1f" : "#fafafa",
      },
      Button: {
        borderRadius: 8,
        controlHeight: 40,
        controlHeightLG: 48,
        controlHeightSM: 32,
        fontWeight: 500,
        primaryShadow: "0 2px 0 rgba(0, 0, 0, 0.02)",
      },
      Input: {
        borderRadius: 8,
        controlHeight: 40,
        controlHeightLG: 48,
        controlHeightSM: 32,
        activeBorderColor: "#1677ff",
        hoverBorderColor: "#4096ff",
      },
      Select: {
        borderRadius: 8,
        controlHeight: 40,
        controlHeightLG: 48,
        controlHeightSM: 32,
      },
      Drawer: {
        borderRadius: 12,
        paddingLG: 24,
      },
      Modal: {
        borderRadius: 12,
        paddingContentHorizontal: 24,
        paddingContentVertical: 20,
      },
      Tag: {
        borderRadius: 6,
        fontSizeSM: 12,
      },
      Typography: {
        titleMarginBottom: "0.5em",
        titleMarginTop: "1.2em",
      },
    },
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      <ConfigProvider theme={antdThemeConfig}>
        <App
          style={{
            minHeight: "100vh",
            fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 'Roboto', 'Helvetica Neue', Arial, sans-serif`,
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          }}
        >
          {children}
        </App>
      </ConfigProvider>
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
