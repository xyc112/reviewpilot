import { Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Layout as AntLayout,
  Button,
  Space,
  Typography,
  theme as antdTheme,
  Avatar,
  Dropdown,
  type MenuProps,
} from "antd";
import {
  LogoutOutlined,
  UserOutlined,
  DashboardOutlined,
  MoonOutlined,
  SunOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "../stores";
import { useTheme, Sidebar } from "./index";
import { useGlobalShortcuts } from "../hooks";

const { Header, Content } = AntLayout;
const { Text } = Typography;

const Layout = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 启用全局快捷键
  useGlobalShortcuts();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const {
    token: { colorBgContainer, colorBorder, colorText, borderRadius, motionDurationMid, motionEaseInOut },
  } = antdTheme.useToken();

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: (
        <Space>
          <UserOutlined />
          <span>个人资料</span>
        </Space>
      ),
      disabled: true,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: (
        <Space>
          <LogoutOutlined />
          <span>退出登录</span>
        </Space>
      ),
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      <Sidebar />
      <AntLayout
        style={{
          marginLeft: isMobile ? 0 : 260,
        }}
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
            borderBottom: `1px solid ${colorBorder}`,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            height: 64,
          }}
        >
          <Space size="middle">
            <DashboardOutlined
              style={{ fontSize: 22, color: "#1677ff" }}
            />
            <Text strong style={{ fontSize: 20, fontWeight: 600 }}>
              ReviewPilot
            </Text>
          </Space>
          <Space size="middle">
            <Button
              type="text"
              icon={theme === "light" ? <MoonOutlined /> : <SunOutlined />}
              onClick={toggleTheme}
              title={theme === "light" ? "切换到暗色模式" : "切换到亮色模式"}
              style={{ borderRadius: 8 }}
            />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space
                style={{
                  cursor: "pointer",
                  padding: "4px 12px",
                  borderRadius: borderRadius,
                  transition: `background-color ${motionDurationMid} ${motionEaseInOut}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    theme === "dark"
                      ? "rgba(255, 255, 255, 0.08)"
                      : "rgba(0, 0, 0, 0.04)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  style={{ backgroundColor: "#1677ff" }}
                />
                <Text style={{ fontWeight: 500 }}>{user?.username}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content
          style={{
            margin: "2rem",
            padding: 0,
            minHeight: 280,
            background: "transparent",
            maxWidth: 1400,
            marginLeft: "auto",
            marginRight: "auto",
            width: "100%",
          }}
        >
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
