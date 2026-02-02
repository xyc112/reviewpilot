import { Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Layout as AntLayout,
  Button,
  Space,
  Typography,
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
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 启用全局快捷键
  useGlobalShortcuts();

  const handleLogout = () => {
    logout();
    void navigate("/login");
  };

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
    <AntLayout className="min-h-screen">
      <Sidebar />
      <AntLayout className={isMobile ? "" : "ml-[260px]"}>
        <Header className="sticky top-0 z-[100] flex h-16 items-center justify-between border-b border-[var(--ant-color-border)] bg-[var(--ant-color-bg-container)] px-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur-[12px]">
          <Space size="middle">
            <DashboardOutlined className="text-[22px] text-[#1677ff]" />
            <Text strong className="text-xl font-semibold">
              ReviewPilot
            </Text>
          </Space>
          <Space size="middle">
            <Button
              type="text"
              icon={theme === "light" ? <MoonOutlined /> : <SunOutlined />}
              onClick={toggleTheme}
              title={theme === "light" ? "切换到暗色模式" : "切换到亮色模式"}
              className="rounded-lg"
            />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space className="cursor-pointer rounded-[var(--ant-border-radius)] px-3 py-1 transition-colors hover:bg-black/5 dark:hover:bg-white/[0.08]">
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  className="!bg-[#1677ff]"
                />
                <Text className="font-medium">{user?.username}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content className="mx-auto my-8 min-h-[280px] max-w-[1400px] w-full bg-transparent p-0">
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
