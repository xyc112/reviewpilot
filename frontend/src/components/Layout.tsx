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
            borderBottom: "1px solid",
            borderBottomColor: "rgba(0, 0, 0, 0.06)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            height: 64,
          }}
        >
          <Space size="middle">
            <DashboardOutlined style={{ fontSize: 22, color: "#1677ff" }} />
            <Text strong style={{ fontSize: 20, fontWeight: 600 }}>
              ReviewPilot
            </Text>
          </Space>
          <Space size="middle">
            <Space
              size="small"
              style={{ padding: "4px 12px", borderRadius: 8 }}
            >
              <UserOutlined style={{ color: "#1677ff" }} />
              <Text style={{ fontWeight: 500 }}>{user?.username}</Text>
            </Space>
            <Button
              type="text"
              icon={theme === "light" ? <MoonOutlined /> : <SunOutlined />}
              onClick={toggleTheme}
              title={theme === "light" ? "切换到暗色模式" : "切换到亮色模式"}
              style={{ borderRadius: 8 }}
            />
            <Button
              type="text"
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{ borderRadius: 8 }}
            >
              退出
            </Button>
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
