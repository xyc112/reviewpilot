import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  Calendar,
  BookOpen,
  FolderOpen,
  TrendingUp,
  Info,
  GitBranch,
  FileText,
  ClipboardList,
  XCircle,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
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
    label: "计划",
    icon: <Calendar className="size-6 shrink-0" />,
    path: ROUTES.REVIEW_PLAN,
  },
  {
    key: "courses",
    label: "课程",
    icon: <BookOpen className="size-6 shrink-0" />,
    path: ROUTES.COURSES,
  },
  {
    key: "progress",
    label: "进度",
    icon: <TrendingUp className="size-6 shrink-0" />,
    path: ROUTES.PROGRESS,
  },
  {
    key: "course-overview",
    label: "概览",
    icon: <Info className="size-6 shrink-0" />,
    getPath: (id) => ROUTES.COURSE_OVERVIEW(id),
    requireCourse: true,
  },
  {
    key: "graph",
    label: "图谱",
    icon: <GitBranch className="size-6 shrink-0" />,
    path: ROUTES.GRAPH,
    requireCourse: true,
  },
  {
    key: "notes",
    label: "笔记",
    icon: <FileText className="size-6 shrink-0" />,
    path: ROUTES.NOTES,
    requireCourse: true,
  },
  {
    key: "quizzes",
    label: "测验",
    icon: <ClipboardList className="size-6 shrink-0" />,
    path: ROUTES.QUIZZES,
    requireCourse: true,
  },
  {
    key: "wrong-questions",
    label: "错题",
    icon: <XCircle className="size-6 shrink-0" />,
    path: ROUTES.WRONG_QUESTIONS,
    requireCourse: true,
  },
  {
    key: "community",
    label: "社区",
    icon: <MessageCircle className="size-6 shrink-0" />,
    getPath: (id) => ROUTES.COURSE_COMMUNITY(id),
    requireCourse: true,
  },
  {
    key: "course-files",
    label: "资料",
    icon: <FolderOpen className="size-6 shrink-0" />,
    getPath: (id) => ROUTES.COURSE_FILES(id),
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
    if (path.includes("/files")) return "course-files";
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
      <div className="px-2 py-3">
        <div
          className={cn(
            "flex w-full min-h-[3.25rem] items-center justify-center rounded-xl px-3 py-3 text-center text-base font-medium",
            currentStudyingCourse
              ? "bg-primary text-primary-foreground"
              : "bg-foreground text-background",
          )}
        >
          <span
            className="max-w-full truncate"
            title={currentStudyingCourse?.title}
          >
            {currentStudyingCourse ? currentStudyingCourse.title : "请选择课程"}
          </span>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 px-2 py-2">
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
                "flex w-full items-center justify-center gap-2 rounded-lg border-l-2 py-3.5 pl-[calc(0.5rem-2px)] pr-6 text-lg font-medium transition-all",
                selected
                  ? "border-l-primary bg-primary/10 text-primary"
                  : "border-l-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              {item.icon}
              <span>{item.label}</span>
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
            <SheetContent side="left" className="w-[240px] rounded-r-xl p-0">
              <SheetTitle className="sr-only">导航</SheetTitle>
              {menuContent}
            </SheetContent>
          </Sheet>
        </div>
      ) : null}

      {!isMobile ? (
        <aside
          className="fixed left-0 top-0 bottom-0 z-40 h-screen w-[220px] overflow-auto bg-card/90 shadow-sm backdrop-blur-xl"
          aria-label="主导航"
        >
          {menuContent}
        </aside>
      ) : null}
    </>
  );
};

export default Sidebar;
