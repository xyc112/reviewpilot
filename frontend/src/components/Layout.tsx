import { Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Layout as AntLayout,
  Button,
  Space,
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
    <AntLayout className="min-h-screen bg-stone-50/80 dark:bg-neutral-950/80">
      <Sidebar />
      <AntLayout className={isMobile ? "" : "ml-[260px]"}>
        <Header className="sticky top-0 z-[100] flex h-16 items-center justify-between border-b border-stone-200/80 bg-white/90 px-6 shadow-sm backdrop-blur-md dark:border-neutral-700/80 dark:bg-neutral-900/90 md:px-8">
          <Space size="middle" className="gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <DashboardOutlined className="text-lg" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100 md:text-xl">
              ReviewPilot
            </span>
          </Space>
          <Space size="middle" className="gap-1">
            <Button
              type="text"
              icon={theme === "light" ? <MoonOutlined /> : <SunOutlined />}
              onClick={toggleTheme}
              title={theme === "light" ? "切换到暗色模式" : "切换到亮色模式"}
              className="rounded-xl text-stone-600 hover:!bg-stone-100 hover:!text-stone-900 dark:text-stone-400 dark:hover:!bg-neutral-700 dark:hover:!text-stone-100"
            />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space className="cursor-pointer rounded-xl px-3 py-2 transition-colors hover:bg-stone-100 dark:hover:bg-neutral-800">
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  className="!bg-blue-600 !text-white dark:!bg-blue-500"
                />
                <span className="hidden font-medium text-stone-700 dark:text-stone-300 sm:inline">
                  {user?.username}
                </span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content className="mx-auto my-6 min-h-[280px] max-w-[1400px] w-full px-4 md:my-8 md:px-6">
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
