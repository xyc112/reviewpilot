import React from "react";
import { Layout, Button, Dropdown, Avatar, Space, Typography } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "@/stores/authStore";
import { css } from "@emotion/react";

const { Header } = Layout;
const { Text } = Typography;

interface AppHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

const headerStyles = {
  header: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    border-bottom: 1px solid #f0f0f0;
    padding: 0 24px;
  `,
  leftSection: css`
    display: flex;
    align-items: center;
    gap: 16px;
  `,
  logo: css`
    font-size: 18px;
    font-weight: 600;
    color: #1890ff;
  `,
  userInfo: css`
    display: flex;
    align-items: center;
    gap: 8px;
  `,
};

const AppHeader: React.FC<AppHeaderProps> = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuthStore();

  const handleMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case "logout":
        logout();
        break;
      case "settings":
        // 跳转到设置页面
        break;
    }
  };

  const menuItems = [
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "个人设置",
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "退出登录",
    },
  ];

  return (
    <Header css={headerStyles.header}>
      <div css={headerStyles.leftSection}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          style={{ fontSize: "16px", width: 64, height: 64 }}
        />
        <div css={headerStyles.logo}>ReviewPilot</div>
      </div>

      <div css={headerStyles.userInfo}>
        <Space>
          <Avatar icon={<UserOutlined />} />
          <Text>{user?.realName || user?.username}</Text>
          <Dropdown
            menu={{
              items: menuItems,
              onClick: handleMenuClick,
            }}
            placement="bottomRight"
          >
            <Button type="text" style={{ padding: "4px" }}>
              <SettingOutlined />
            </Button>
          </Dropdown>
        </Space>
      </div>
    </Header>
  );
};

export default AppHeader;
