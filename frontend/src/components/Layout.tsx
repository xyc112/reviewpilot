import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  Layout as AntLayout,
  Button,
  Space,
  Typography,
  theme as antdTheme,
} from "antd";
import {
  LogoutOutlined,
  UserOutlined,
  DashboardOutlined,
  MoonOutlined,
  SunOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "./ThemeProvider";
import Sidebar from "./Sidebar";
import { useGlobalShortcuts } from "../hooks/useKeyboardShortcuts";

const { Header, Content } = AntLayout;
const { Text } = Typography;

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // 启用全局快捷键
  useGlobalShortcuts();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const {
    token: { colorBgContainer },
  } = antdTheme.useToken();

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      <Sidebar />
      <AntLayout
        style={{
          marginLeft: 260,
        }}
        className="main-layout"
      >
        <Header
          style={{
            padding: "0 2rem",
            background: colorBgContainer,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 100,
            borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <Space>
            <DashboardOutlined style={{ fontSize: 20 }} />
            <Text strong style={{ fontSize: 18 }}>
              ReviewPilot
            </Text>
          </Space>
          <Space>
            <Space>
              <UserOutlined />
              <Text>{user?.username}</Text>
            </Space>
            <Button
              icon={theme === "light" ? <MoonOutlined /> : <SunOutlined />}
              onClick={toggleTheme}
              title={theme === "light" ? "切换到暗色模式" : "切换到亮色模式"}
            />
            <Button icon={<LogoutOutlined />} onClick={handleLogout}>
              退出
            </Button>
          </Space>
        </Header>
        <Content
          style={{
            margin: "2rem",
            padding: 0,
            minHeight: 280,
            background: colorBgContainer,
            maxWidth: 1400,
            marginLeft: "auto",
            marginRight: "auto",
            width: "100%",
          }}
        >
          <Outlet />
        </Content>
      </AntLayout>
      <style>{`
        @media (max-width: 1024px) {
          .main-layout {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </AntLayout>
  );
};

export default Layout;
