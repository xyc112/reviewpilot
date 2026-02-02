import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Drawer, Typography, Tag, Button } from "antd";
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
  const currentStudyingCourse = useCourseStore(
    (state) => state.currentStudyingCourse,
  );
  useAuthStore((state) => state.user);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    setIsMobileMenuOpen(false);
    switch (key) {
      case "review-plan":
        void navigate("/review-plan");
        break;
      case "courses":
        void navigate("/courses");
        break;
      case "progress":
        void navigate("/progress");
        break;
      case "course-overview":
        if (currentStudyingCourse) {
          void navigate(
            `/courses/${String(currentStudyingCourse.id)}/overview`,
          );
        }
        break;
      case "graph":
        void navigate("/graph");
        break;
      case "notes":
        void navigate("/notes");
        break;
      case "quizzes":
        void navigate("/quizzes");
        break;
      case "wrong-questions":
        void navigate("/wrong-questions");
        break;
      case "community":
        if (currentStudyingCourse) {
          void navigate(
            `/courses/${String(currentStudyingCourse.id)}/community`,
          );
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
      <div className="border-b border-black/[0.06] dark:border-white/10 p-6">
        <Title level={4} className="!m-0 !mb-4 font-semibold text-lg">
          导航
        </Title>
        {currentStudyingCourse ? (
          <Tag
            color="gold"
            icon={<StarOutlined />}
            className="flex items-center gap-2 py-2 px-3 rounded-lg text-[13px] font-medium border-0 max-w-full"
          >
            <Text
              ellipsis
              className="max-w-[200px] text-[13px]"
              title={currentStudyingCourse.title}
            >
              {currentStudyingCourse.title}
            </Text>
          </Tag>
        ) : null}
      </div>
      <Menu
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        items={menuItems}
        onClick={handleMenuClick}
        className="!border-r-0 flex-1 bg-transparent !p-2"
      />
    </>
  );

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

  return (
    <>
      {/* 移动端菜单按钮和抽屉 */}
      {isMobile ? (
        <div className="fixed top-4 left-4 z-[100]">
          <Button
            icon={<MenuOutlined />}
            onClick={() => {
              setIsMobileMenuOpen(true);
            }}
            type="default"
            size="large"
          />
        </div>
      ) : null}

      <Drawer
        title="导航"
        placement="left"
        onClose={() => {
          setIsMobileMenuOpen(false);
        }}
        open={isMobileMenuOpen}
        size={260}
        styles={{ body: { padding: 0 } }}
      >
        {menuContent}
      </Drawer>

      {/* 桌面端侧边栏 - 使用 Ant Design Sider */}
      {!isMobile ? (
        <Sider
          width={260}
          className="!fixed left-0 top-0 bottom-0 !h-screen overflow-auto bg-white dark:bg-[#141414] border-r border-black/[0.06] dark:border-white/10"
        >
          {menuContent}
        </Sider>
      ) : null}
    </>
  );
};

export default Sidebar;
