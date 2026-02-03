import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, BookOpen, Star, X } from "lucide-react";
import type { Course } from "@/shared/types";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { courseAPI, userCourseAPI } from "@/shared/api";
import { useAuthStore, useCourseStore } from "@/shared/stores";
import {
  ConfirmDialog,
  useToast,
  SkeletonGrid,
  SearchBox,
  ListEmptyState,
  ListItemCard,
} from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";
import { ROUTES } from "@/shared/config/routes";

const CourseList = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    courseId: number | null;
  }>({
    isOpen: false,
    courseId: null,
  });
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";
  const currentStudyingCourse = useCourseStore(
    (state) => state.currentStudyingCourse,
  );
  const selectedCourseIds = useCourseStore((state) => state.selectedCourseIds);
  const refreshUserCourses = useCourseStore(
    (state) => state.refreshUserCourses,
  );
  const { success, error: showError } = useToast();

  useEffect(() => {
    void fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getCourses();
      setCourses(response.data);
    } catch {
      setError("获取课程列表失败");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToStudyList = async (course: Course) => {
    try {
      await userCourseAPI.addCourse(course.id);
      success(`已将 "${course.title}" 添加到学习列表`);
      await refreshUserCourses();
    } catch (err: unknown) {
      const errorMsg =
        "添加到学习列表失败: " + (getErrorMessage(err) || "未知错误");
      showError(errorMsg);
    }
  };

  const handleRemoveFromStudyList = async (course: Course) => {
    try {
      await userCourseAPI.removeCourse(course.id);
      success(`已将 "${course.title}" 从学习列表移除`);
      await refreshUserCourses();
    } catch (err: unknown) {
      const errorMsg = "移除课程失败: " + (getErrorMessage(err) || "未知错误");
      showError(errorMsg);
    }
  };

  const handleSetCurrentStudying = async (course: Course) => {
    try {
      await userCourseAPI.setCurrentStudying(course.id);
      success(`已将 "${course.title}" 设置为当前学习课程`);
      await refreshUserCourses();
    } catch (err: unknown) {
      const errorMsg =
        "设置当前学习课程失败: " + (getErrorMessage(err) || "未知错误");
      showError(errorMsg);
    }
  };

  const handleEndStudying = async (course: Course) => {
    try {
      await userCourseAPI.unsetCurrentStudying();
      success(`已结束学习 "${course.title}"`);
      await refreshUserCourses();
    } catch (err: unknown) {
      const errorMsg = "结束学习失败: " + (getErrorMessage(err) || "未知错误");
      showError(errorMsg);
    }
  };

  // 判断课程状态：0-未添加到学习，1-已添加未开始，2-正在学习
  const getCourseState = (course: Course): number => {
    if (currentStudyingCourse?.id === course.id) {
      return 2; // 正在学习
    } else if (selectedCourseIds.has(course.id)) {
      return 1; // 已添加到学习列表但未开始
    }
    return 0; // 未添加到学习
  };

  const handleDeleteCourse = (courseId: number) => {
    setDeleteConfirm({ isOpen: true, courseId });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.courseId) return;
    try {
      await courseAPI.deleteCourse(deleteConfirm.courseId);
      success("课程删除成功");
      // 删除课程后刷新用户课程列表
      await refreshUserCourses();
      void fetchCourses();
    } catch (err: unknown) {
      const errorMsg = "删除课程失败: " + (getErrorMessage(err) || "未知错误");
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setDeleteConfirm({ isOpen: false, courseId: null });
    }
  };

  const getLevelText = (level: string) => {
    const levels: Record<string, string> = {
      BEGINNER: "初级",
      INTERMEDIATE: "中级",
      ADVANCED: "高级",
    };
    return levels[level] ?? level;
  };

  const getLevelColor = (level: string): string => {
    const colors: Record<string, string> = {
      BEGINNER: "green",
      INTERMEDIATE: "orange",
      ADVANCED: "red",
    };
    return colors[level] ?? "default";
  };

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses;
    const q = searchQuery.toLowerCase();
    return courses.filter(
      (course) =>
        course.title.toLowerCase().includes(q) ||
        (course.description || "").toLowerCase().includes(q),
    );
  }, [courses, searchQuery]);

  if (loading) {
    return <SkeletonGrid count={6} />;
  }

  if (error) {
    return (
      <Alert
        variant="destructive"
        className="mx-auto my-8 max-w-[1400px] rounded-xl"
      >
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="mx-auto w-full max-w-[1000px] flex h-full min-h-0 flex-col overflow-hidden">
        <div className="mb-4 flex shrink-0 items-center justify-between gap-4">
          <SearchBox
            placeholder="搜索课程..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
          {isAdmin ? (
            <Link to={ROUTES.CREATE_COURSE} className="shrink-0">
              <Button size="sm">
                <Plus className="size-4" />
                新建
              </Button>
            </Link>
          ) : null}
        </div>

        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          title="删除课程"
          message="确定要删除这个课程吗？此操作不可撤销，将删除课程及其所有相关内容。"
          confirmText="删除"
          cancelText="取消"
          type="danger"
          onConfirm={() => {
            void confirmDelete();
          }}
          onCancel={() => {
            setDeleteConfirm({ isOpen: false, courseId: null });
          }}
        />

        <div className="min-h-0 flex-1 overflow-auto">
          {courses.length === 0 ? (
            <ListEmptyState
              variant="empty"
              icon={<BookOpen className="size-12 text-muted-foreground" />}
              description={isAdmin ? "暂无课程，可创建新课程" : "暂无课程"}
              action={
                isAdmin ? (
                  <Link to={ROUTES.CREATE_COURSE}>
                    <Button size="sm">
                      <Plus className="size-4" />
                      创建
                    </Button>
                  </Link>
                ) : undefined
              }
            />
          ) : filteredCourses.length === 0 ? (
            <ListEmptyState
              variant="noResults"
              description="无匹配课程"
              onClearFilter={() => {
                setSearchQuery("");
              }}
              clearFilterLabel="清空搜索"
            />
          ) : (
            <div className="space-y-2">
              {filteredCourses.map((course) => {
                const state = getCourseState(course);
                return (
                  <ListItemCard
                    key={course.id}
                    cursor="pointer"
                    onClick={() => {
                      void navigate(ROUTES.COURSE_DETAIL(course.id));
                    }}
                  >
                    <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
                      <div className="min-w-0 flex-1 flex items-center gap-3">
                        <h4 className="m-0 truncate text-base font-semibold text-foreground">
                          {course.title}
                        </h4>
                        <Badge
                          variant={
                            getLevelColor(course.level) === "green"
                              ? "secondary"
                              : getLevelColor(course.level) === "orange"
                                ? "outline"
                                : "destructive"
                          }
                          className="shrink-0 text-sm"
                        >
                          {getLevelText(course.level)}
                        </Badge>
                        {currentStudyingCourse?.id === course.id ? (
                          <Badge
                            variant="secondary"
                            className="shrink-0 text-sm bg-primary/15 text-primary"
                          >
                            正在学习
                          </Badge>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 gap-2">
                        {state === 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleAddToStudyList(course);
                            }}
                          >
                            <BookOpen className="size-4" />
                            添加
                          </Button>
                        )}
                        {state === 1 && (
                          <>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleSetCurrentStudying(course);
                              }}
                            >
                              <Star className="size-4" />
                              开始
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleRemoveFromStudyList(course);
                              }}
                            >
                              <X className="size-4" />
                            </Button>
                          </>
                        )}
                        {state === 2 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleEndStudying(course);
                            }}
                          >
                            <Star className="size-4" />
                            结束
                          </Button>
                        )}
                        {isAdmin ? (
                          <>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                void navigate(ROUTES.EDIT_COURSE(course.id));
                              }}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCourse(course.id);
                              }}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </ListItemCard>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseList;
