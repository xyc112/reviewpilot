import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Network,
  FileText,
  ClipboardList,
  Menu,
  X,
  TrendingUp,
  Star,
  MessageSquare,
  BookX,
  Info,
  Calendar,
} from "lucide-react";
import { useCourse } from "../context/CourseContext";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentStudyingCourse } = useCourse();
  const { isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 移动端：点击外部区域关闭菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        isMobileMenuOpen &&
        !target.closest(".sidebar") &&
        !target.closest(".mobile-menu-button")
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // 路由变化时关闭移动端菜单
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const menuItems = [
    {
      id: "review-plan",
      label: "复习计划",
      icon: Calendar,
      path: "/review-plan",
      requiresCourse: false,
    },
    {
      id: "courses",
      label: "课程列表",
      icon: BookOpen,
      path: "/courses",
      requiresCourse: false,
    },
    {
      id: "progress",
      label: "学习进度",
      icon: TrendingUp,
      path: "/progress",
      requiresCourse: false,
    },
    {
      id: "course-overview",
      label: "课程概览",
      icon: Info,
      path: "/course-overview",
      requiresCourse: true,
    },
    {
      id: "graph",
      label: "知识图谱",
      icon: Network,
      path: "/graph",
      requiresCourse: true,
    },
    {
      id: "notes",
      label: "笔记模块",
      icon: FileText,
      path: "/notes",
      requiresCourse: true,
    },
    {
      id: "quizzes",
      label: "测验模块",
      icon: ClipboardList,
      path: "/quizzes",
      requiresCourse: true,
    },
    {
      id: "wrong-questions",
      label: "错题模块",
      icon: BookX,
      path: "/wrong-questions",
      requiresCourse: true,
    },
    {
      id: "community",
      label: "社区模块",
      icon: MessageSquare,
      path: "/community",
      requiresCourse: true,
    },
  ];

  const handleMenuClick = (
    item: (typeof menuItems)[0],
    e: React.MouseEvent,
  ) => {
    if (item.requiresCourse && !currentStudyingCourse) {
      e.preventDefault();
      // 如果没有正在学习的课程，先导航到课程列表
      navigate("/courses");
      return;
    }

    // 特殊处理社区路由，需要courseId
    if (item.id === "community" && currentStudyingCourse) {
      e.preventDefault();
      navigate(`/courses/${currentStudyingCourse.id}/community`);
    }

    // 特殊处理课程概览路由，需要courseId
    if (item.id === "course-overview" && currentStudyingCourse) {
      e.preventDefault();
      navigate(`/courses/${currentStudyingCourse.id}/overview`);
    }
  };

  const isActive = (path: string) => {
    if (path === "/courses") {
      return location.pathname === "/courses" || location.pathname === "/";
    }
    // 特殊处理社区路由
    if (path === "/community") {
      return location.pathname.includes("/community");
    }
    // 特殊处理课程概览路由
    if (path === "/course-overview") {
      return location.pathname.includes("/overview");
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* 移动端菜单按钮 */}
      <button
        className="mobile-menu-button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label={isMobileMenuOpen ? "关闭菜单" : "打开菜单"}
        aria-expanded={isMobileMenuOpen}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* 移动端遮罩层 */}
      {isMobileMenuOpen && <div className="sidebar-overlay" />}

      <aside
        className={`sidebar ${isMobileMenuOpen ? "open" : ""}`}
        aria-label="主导航"
      >
        <div className="sidebar-header">
          <h2>导航</h2>
          {currentStudyingCourse && (
            <div className="selected-course-info">
              <div
                className="selected-course-title"
                title={currentStudyingCourse.title}
              >
                <Star
                  size={14}
                  style={{
                    marginRight: "0.25rem",
                    display: "inline-block",
                    verticalAlign: "middle",
                  }}
                />
                {currentStudyingCourse.title}
              </div>
            </div>
          )}
        </div>

        <nav className="sidebar-nav" role="navigation" aria-label="主菜单">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const disabled = item.requiresCourse && !currentStudyingCourse;
            const active = isActive(item.path);

            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={(e) => handleMenuClick(item, e)}
                className={`sidebar-item ${active ? "active" : ""} ${disabled ? "disabled" : ""}`}
                title={disabled ? "请先开始学习一门课程" : item.label}
                aria-current={active ? "page" : undefined}
                aria-disabled={disabled}
              >
                <Icon size={20} aria-hidden="true" />
                <span>{item.label}</span>
                {disabled && (
                  <span className="disabled-hint">（需开始学习）</span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
