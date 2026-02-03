import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  Calendar,
  BookOpen,
  TrendingUp,
  Info,
  GitBranch,
  FileText,
  ClipboardList,
  XCircle,
  MessageCircle,
  Star,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { Badge } from "@/shared/components/ui/badge";
import { useCourseStore, useAuthStore } from "@/shared/stores";
import { cn } from "@/shared/lib/utils";
import { ROUTES } from "@/shared/config/routes";

const navItems: {
  key: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  getPath?: (id: number) => string;
  requireCourse?: boolean;
}[] = [
  {
    key: "review-plan",
    label: "复习计划",
    icon: <Calendar className="size-4" />,
    path: ROUTES.REVIEW_PLAN,
  },
  {
    key: "courses",
    label: "课程列表",
    icon: <BookOpen className="size-4" />,
    path: ROUTES.COURSES,
  },
  {
    key: "progress",
    label: "学习进度",
    icon: <TrendingUp className="size-4" />,
    path: ROUTES.PROGRESS,
  },
  {
    key: "course-overview",
    label: "课程概览",
    icon: <Info className="size-4" />,
    getPath: (id) => ROUTES.COURSE_OVERVIEW(id),
    requireCourse: true,
  },
  {
    key: "graph",
    label: "知识图谱",
    icon: <GitBranch className="size-4" />,
    path: ROUTES.GRAPH,
    requireCourse: true,
  },
  {
    key: "notes",
    label: "笔记模块",
    icon: <FileText className="size-4" />,
    path: ROUTES.NOTES,
    requireCourse: true,
  },
  {
    key: "quizzes",
    label: "测验模块",
    icon: <ClipboardList className="size-4" />,
    path: ROUTES.QUIZZES,
    requireCourse: true,
  },
  {
    key: "wrong-questions",
    label: "错题模块",
    icon: <XCircle className="size-4" />,
    path: ROUTES.WRONG_QUESTIONS,
    requireCourse: true,
  },
  {
    key: "community",
    label: "社区模块",
    icon: <MessageCircle className="size-4" />,
    getPath: (id) => ROUTES.COURSE_COMMUNITY(id),
    requireCourse: true,
  },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentStudyingCourse = useCourseStore(
    (state) => state.currentStudyingCourse,
  );
  useAuthStore((state) => state.user);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === ROUTES.COURSES || path === ROUTES.HOME) return "courses";
    if (path.includes("/community")) return "community";
    if (path.includes("/overview")) return "course-overview";
    if (path.startsWith("/app/review-plan")) return "review-plan";
    if (path.startsWith("/app/progress")) return "progress";
    if (path.startsWith("/app/graph")) return "graph";
    if (path.startsWith("/app/notes")) return "notes";
    if (path.startsWith("/app/quizzes")) return "quizzes";
    if (path.startsWith("/app/wrong-questions")) return "wrong-questions";
    return "";
  };

  const handleNav = (key: string) => {
    const item = navItems.find((i) => i.key === key);
    if (!item) return;
    if (item.path) {
      void navigate(item.path);
    } else if (item.getPath && currentStudyingCourse) {
      void navigate(item.getPath(currentStudyingCourse.id));
    }
    setIsMobileMenuOpen(false);
  };

  const menuContent = (
    <>
      <div className="border-b border-border p-5">
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          导航
        </h4>
        {currentStudyingCourse ? (
          <Badge
            variant="secondary"
            className="flex max-w-full items-center gap-2 rounded-xl border-0 px-3 py-2 text-[13px] font-medium shadow-sm"
          >
            <Star className="size-4 shrink-0" />
            <span
              className="max-w-[200px] truncate text-[13px]"
              title={currentStudyingCourse.title}
            >
              {currentStudyingCourse.title}
            </span>
          </Badge>
        ) : null}
      </div>
      <nav className="flex-1 space-y-0.5 p-2">
        {navItems.map((item) => {
          const disabled = item.requireCourse && !currentStudyingCourse;
          const selected = getSelectedKey() === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                if (!disabled) handleNav(item.key);
              }}
              disabled={disabled}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
                selected
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>
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
      {isMobile ? (
        <div className="fixed left-4 top-4 z-[100]">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl shadow-md"
              >
                <Menu className="size-5" />
                <span className="sr-only">打开菜单</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <SheetTitle className="sr-only">导航</SheetTitle>
              {menuContent}
            </SheetContent>
          </Sheet>
        </div>
      ) : null}

      {!isMobile ? (
        <aside
          className="fixed left-0 top-0 bottom-0 z-40 h-screen w-[260px] overflow-auto border-r border-border bg-card/95 shadow-sm backdrop-blur-xl"
          aria-label="主导航"
        >
          {menuContent}
        </aside>
      ) : null}
    </>
  );
};

export default Sidebar;
