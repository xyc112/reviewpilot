import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Drawer, Typography, Tag, Button } from "antd";
import type { MenuProps } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import {
  BookOpen,
  Network,
  FileText,
  ClipboardList,
  TrendingUp,
  Star,
  MessageSquare,
  BookX,
  Info,
  Calendar,
} from "lucide-react";
import { useCourseStore } from "../stores/courseStore";
import { useAuthStore } from "../stores/authStore";

const { Title, Text } = Typography;

const Sidebar: React.FC = () => {
  const location = useLocation();
  const currentStudyingCourse = useCourseStore((state) => state.currentStudyingCourse);
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

  const menuItems: MenuProps["items"] = [
    {
      key: "review-plan",
      label: <Link to="/review-plan">复习计划</Link>,
      icon: <Calendar size={20} />,
    },
    {
      key: "courses",
      label: <Link to="/courses">课程列表</Link>,
      icon: <BookOpen size={20} />,
    },
    {
      key: "progress",
      label: <Link to="/progress">学习进度</Link>,
      icon: <TrendingUp size={20} />,
    },
    {
      key: "course-overview",
      label: (
        <Link
          to={
            currentStudyingCourse
              ? `/courses/${currentStudyingCourse.id}/overview`
              : "/courses"
          }
        >
          课程概览
        </Link>
      ),
      icon: <Info size={20} />,
      disabled: !currentStudyingCourse,
    },
    {
      key: "graph",
      label: <Link to="/graph">知识图谱</Link>,
      icon: <Network size={20} />,
      disabled: !currentStudyingCourse,
    },
    {
      key: "notes",
      label: <Link to="/notes">笔记模块</Link>,
      icon: <FileText size={20} />,
      disabled: !currentStudyingCourse,
    },
    {
      key: "quizzes",
      label: <Link to="/quizzes">测验模块</Link>,
      icon: <ClipboardList size={20} />,
      disabled: !currentStudyingCourse,
    },
    {
      key: "wrong-questions",
      label: <Link to="/wrong-questions">错题模块</Link>,
      icon: <BookX size={20} />,
      disabled: !currentStudyingCourse,
    },
    {
      key: "community",
      label: (
        <Link
          to={
            currentStudyingCourse
              ? `/courses/${currentStudyingCourse.id}/community`
              : "/courses"
          }
        >
          社区模块
        </Link>
      ),
      icon: <MessageSquare size={20} />,
      disabled: !currentStudyingCourse,
    },
  ];

  const menuContent = (
    <>
      <div
        style={{
          padding: "1.5rem",
          borderBottom: "1px solid",
          borderBottomColor: "rgba(0, 0, 0, 0.06)",
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
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 0.75rem",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              border: "none",
            }}
          >
            <Star size={14} />
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
        style={{
          borderRight: 0,
          flex: 1,
          background: "transparent",
          padding: "0.5rem",
        }}
      />
    </>
  );

  return (
    <>
      {/* 移动端菜单按钮和抽屉 */}
      <div
        style={{
          display: "none",
          position: "fixed",
          top: "1rem",
          left: "1rem",
          zIndex: 100,
        }}
        className="mobile-menu-button"
      >
        <Button
          icon={<MenuOutlined />}
          onClick={() => setIsMobileMenuOpen(true)}
          type="default"
        />
      </div>

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

      {/* 桌面端侧边栏 */}
      <div
        style={{
          width: 260,
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          background: "transparent",
          borderRight: "1px solid",
          borderRightColor: "rgba(0, 0, 0, 0.06)",
          display: "flex",
          flexDirection: "column",
          zIndex: 50,
          overflowY: "auto",
          overflowX: "hidden",
        }}
        className="desktop-sidebar"
      >
        {menuContent}
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .desktop-sidebar {
            display: none !important;
          }
          .mobile-menu-button {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
