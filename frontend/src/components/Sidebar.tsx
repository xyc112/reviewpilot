import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Drawer, Tag, Button } from "antd";
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
      <div className="border-b border-stone-200/80 p-5 dark:border-neutral-700/80">
        <h4 className="m-0 mb-3 text-sm font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          导航
        </h4>
        {currentStudyingCourse ? (
          <Tag
            color="gold"
            icon={<StarOutlined />}
            className="flex max-w-full items-center gap-2 rounded-xl border-0 px-3 py-2 text-[13px] font-medium shadow-sm"
          >
            <span
              className="max-w-[200px] truncate text-[13px]"
              title={currentStudyingCourse.title}
            >
              {currentStudyingCourse.title}
            </span>
          </Tag>
        ) : null}
      </div>
      <Menu
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        items={menuItems}
        onClick={handleMenuClick}
        className="!border-r-0 flex-1 bg-transparent !p-2 [&_.ant-menu-item]:rounded-xl [&_.ant-menu-item-selected]:bg-blue-500/10 [&_.ant-menu-item-selected]:text-blue-600 dark:[&_.ant-menu-item-selected]:bg-blue-500/20 dark:[&_.ant-menu-item-selected]:text-blue-400"
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
        <div className="fixed left-4 top-4 z-[100]">
          <Button
            icon={<MenuOutlined />}
            onClick={() => {
              setIsMobileMenuOpen(true);
            }}
            type="default"
            size="large"
            className="rounded-xl shadow-md"
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
        size={280}
        classNames={{
          body: "p-0",
          header: "border-b border-stone-200 dark:border-neutral-700",
        }}
        className="[&_.ant-drawer-content]:rounded-r-2xl"
      >
        {menuContent}
      </Drawer>

      {/* 桌面端侧边栏 - 使用 Ant Design Sider */}
      {!isMobile ? (
        <Sider
          width={260}
          className="!fixed left-0 top-0 bottom-0 !h-screen overflow-auto border-r border-stone-200/80 bg-white shadow-sm dark:border-neutral-700/80 dark:bg-neutral-900 dark:shadow-black/20"
        >
          {menuContent}
        </Sider>
      ) : null}
    </>
  );
};

export default Sidebar;
