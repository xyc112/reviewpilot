import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Drawer, Typography, Tag, Button, theme } from "antd";
import type { MenuProps } from "antd";
import {
  MenuOutlined,
  CalendarOutlined,
  BookOutlined,
  LineChartOutlined,
  InfoCircleOutlined,
  ApartmentOutlined,
  FileTextOutlined,
  FormOutlined,
  CloseCircleOutlined,
  MessageOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { useCourseStore, useAuthStore } from "../stores";

const { Sider } = Layout;
const { Title, Text } = Typography;

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    token: { colorBgContainer, colorBorder },
  } = theme.useToken();
  const currentStudyingCourse = useCourseStore(
    (state) => state.currentStudyingCourse,
  );
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 路由变化时关闭移动端菜单
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const getSelectedKey = () => {
    if (location.pathname === "/courses" || location.pathname === "/") {
      return "courses";
    }
    if (location.pathname.includes("/community")) {
      return "community";
    }
    if (location.pathname.includes("/overview")) {
      return "course-overview";
    }
    if (location.pathname.startsWith("/review-plan")) {
      return "review-plan";
    }
    if (location.pathname.startsWith("/progress")) {
      return "progress";
    }
    if (location.pathname.startsWith("/graph")) {
      return "graph";
    }
    if (location.pathname.startsWith("/notes")) {
      return "notes";
    }
    if (location.pathname.startsWith("/quizzes")) {
      return "quizzes";
    }
    if (location.pathname.startsWith("/wrong-questions")) {
      return "wrong-questions";
    }
    return "";
  };

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    switch (key) {
      case "review-plan":
        navigate("/review-plan");
        break;
      case "courses":
        navigate("/courses");
        break;
      case "progress":
        navigate("/progress");
        break;
      case "course-overview":
        if (currentStudyingCourse) {
          navigate(`/courses/${currentStudyingCourse.id}/overview`);
        }
        break;
      case "graph":
        navigate("/graph");
        break;
      case "notes":
        navigate("/notes");
        break;
      case "quizzes":
        navigate("/quizzes");
        break;
      case "wrong-questions":
        navigate("/wrong-questions");
        break;
      case "community":
        if (currentStudyingCourse) {
          navigate(`/courses/${currentStudyingCourse.id}/community`);
        }
        break;
    }
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "review-plan",
      label: "复习计划",
      icon: <CalendarOutlined />,
    },
    {
      key: "courses",
      label: "课程列表",
      icon: <BookOutlined />,
    },
    {
      key: "progress",
      label: "学习进度",
      icon: <LineChartOutlined />,
    },
    {
      key: "course-overview",
      label: "课程概览",
      icon: <InfoCircleOutlined />,
      disabled: !currentStudyingCourse,
    },
    {
      key: "graph",
      label: "知识图谱",
      icon: <ApartmentOutlined />,
      disabled: !currentStudyingCourse,
    },
    {
      key: "notes",
      label: "笔记模块",
      icon: <FileTextOutlined />,
      disabled: !currentStudyingCourse,
    },
    {
      key: "quizzes",
      label: "测验模块",
      icon: <FormOutlined />,
      disabled: !currentStudyingCourse,
    },
    {
      key: "wrong-questions",
      label: "错题模块",
      icon: <CloseCircleOutlined />,
      disabled: !currentStudyingCourse,
    },
    {
      key: "community",
      label: "社区模块",
      icon: <MessageOutlined />,
      disabled: !currentStudyingCourse,
    },
  ];

  const menuContent = (
    <>
      <div
        style={{
          padding: "1.5rem",
          borderBottom: `1px solid ${colorBorder}`,
        }}
      >
        <Title
          level={4}
          style={{
            margin: 0,
            marginBottom: "1rem",
            fontWeight: 600,
            fontSize: 18,
          }}
        >
          导航
        </Title>
        {currentStudyingCourse && (
          <Tag
            color="gold"
            icon={<StarOutlined />}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 0.75rem",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              border: "none",
              maxWidth: "100%",
            }}
          >
            <Text
              ellipsis
              style={{ maxWidth: "200px", fontSize: 13 }}
              title={currentStudyingCourse.title}
            >
              {currentStudyingCourse.title}
            </Text>
          </Tag>
        )}
      </div>
      <Menu
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          borderRight: 0,
          flex: 1,
          background: "transparent",
          padding: "0.5rem",
        }}
      />
    </>
  );

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* 移动端菜单按钮和抽屉 */}
      {isMobile && (
        <div
          style={{
            position: "fixed",
            top: "1rem",
            left: "1rem",
            zIndex: 100,
          }}
        >
          <Button
            icon={<MenuOutlined />}
            onClick={() => setIsMobileMenuOpen(true)}
            type="default"
            size="large"
          />
        </div>
      )}

      <Drawer
        title="导航"
        placement="left"
        onClose={() => setIsMobileMenuOpen(false)}
        open={isMobileMenuOpen}
        width={260}
        styles={{ body: { padding: 0 } }}
      >
        {menuContent}
      </Drawer>

      {/* 桌面端侧边栏 - 使用 Ant Design Sider */}
      {!isMobile && (
        <Sider
          width={260}
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
            background: colorBgContainer,
            borderRight: `1px solid ${colorBorder}`,
            overflow: "auto",
            height: "100vh",
          }}
        >
          {menuContent}
        </Sider>
      )}
    </>
  );
};

export default Sidebar;
