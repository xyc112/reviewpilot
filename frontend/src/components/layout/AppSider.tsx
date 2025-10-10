import React from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  ShareAltOutlined,
  BarChartOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { css } from "@emotion/react";

const { Sider } = Layout;

interface AppSiderProps {
  collapsed: boolean;
}

const siderStyles = {
  sider: css`
    background: #fff;
    border-right: 1px solid #f0f0f0;
  `,
  logo: css`
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid #f0f0f0;
    font-size: 18px;
    font-weight: 600;
    color: #1890ff;
  `,
};

const menuItems = [
  {
    key: "/",
    icon: <DashboardOutlined />,
    label: "学习概览",
  },
  {
    key: "/knowledge-graph",
    icon: <ShareAltOutlined />,
    label: "知识图谱",
  },
  {
    key: "/diagnosis",
    icon: <BarChartOutlined />,
    label: "学习诊断",
  },
  {
    key: "/notes",
    icon: <FileTextOutlined />,
    label: "笔记管理",
  },
  {
    key: "/quiz",
    icon: <QuestionCircleOutlined />,
    label: "测验系统",
  },
  {
    key: "/analytics",
    icon: <TeamOutlined />,
    label: "学习分析",
  },
];

const AppSider: React.FC<AppSiderProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      css={siderStyles.sider}
    >
      {!collapsed && <div css={siderStyles.logo}>ReviewPilot</div>}
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
      />
    </Sider>
  );
};

export default AppSider;
