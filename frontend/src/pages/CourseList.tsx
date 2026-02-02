import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Tag, Space, List, Alert, Badge } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
  StarOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import type { Course } from "../types";
import { courseAPI, userCourseAPI } from "../services";
import { useAuthStore, useCourseStore } from "../stores";
import {
  ConfirmDialog,
  useToast,
  SkeletonGrid,
  SearchHighlight,
  SearchBox,
  ListEmptyState,
  FilterBar,
  ListItemCard,
} from "../components";
import { getErrorMessage } from "../utils";

const CourseList = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
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

  // 获取所有唯一的标签
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    courses.forEach((course) => {
      course.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [courses]);

  // 过滤课程
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      // 搜索过滤
      const matchesSearch =
        !searchQuery ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      // 标签过滤
      const matchesTags =
        selectedTags.size === 0 ||
        course.tags.some((tag) => selectedTags.has(tag));

      return matchesSearch && matchesTags;
    });
  }, [courses, searchQuery, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tag)) {
        newSet.delete(tag);
      } else {
        newSet.add(tag);
      }
      return newSet;
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTags(new Set());
  };

  const hasActiveFilters = searchQuery || selectedTags.size > 0;

  if (loading) {
    return <SkeletonGrid count={6} />;
  }

  if (error) {
    return (
      <Alert
        title={error}
        type="error"
        showIcon
        className="mx-auto my-8 max-w-[1400px] rounded-xl"
      />
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] p-0">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="m-0 text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100 md:text-3xl">
            课程列表
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            浏览并管理您的课程，添加到学习列表即可开始学习
          </p>
        </div>
        {isAdmin ? (
          <Link to="/courses/new" className="shrink-0">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              className="rounded-xl font-medium shadow-md"
            >
              创建新课程
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

      {/* 搜索和过滤栏 */}
      <div className="mb-8 flex w-full flex-col gap-4">
        <SearchBox
          placeholder="搜索课程标题、描述或标签..."
          value={searchQuery}
          onChange={setSearchQuery}
          enterButton
        />
        <FilterBar
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
          clearLabel="清除筛选"
          extra={
            allTags.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
                  标签：
                </span>
                <Space wrap className="gap-1.5">
                  {allTags.map((tag) => (
                    <Tag
                      key={tag}
                      color={selectedTags.has(tag) ? "blue" : "default"}
                      onClick={() => {
                        toggleTag(tag);
                      }}
                      className="cursor-pointer rounded-lg transition-opacity hover:opacity-90"
                    >
                      {tag}
                    </Tag>
                  ))}
                </Space>
              </div>
            ) : undefined
          }
          resultSummary={
            hasActiveFilters
              ? `找到 ${String(filteredCourses.length)} 个课程（共 ${String(courses.length)} 个）`
              : undefined
          }
        />
      </div>

      {/* 课程列表 */}
      {courses.length === 0 ? (
        <ListEmptyState
          variant="empty"
          icon={
            <BookOutlined className="text-[64px] text-stone-300 dark:text-stone-600" />
          }
          description={
            <span>
              还没有创建任何课程，
              {isAdmin ? "立即创建第一个课程吧！" : "请等待管理员创建课程。"}
            </span>
          }
          action={
            isAdmin ? (
              <Link to="/courses/new">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  className="rounded-xl shadow-sm"
                >
                  创建新课程
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : filteredCourses.length === 0 ? (
        <ListEmptyState
          variant="noResults"
          icon={
            <SearchOutlined className="text-[64px] text-stone-300 dark:text-stone-600" />
          }
          description="未找到匹配的课程，尝试调整搜索条件或筛选器"
          onClearFilter={clearFilters}
          clearFilterLabel="清除所有筛选"
        />
      ) : (
        <List
          className="[&_.ant-list-items]:space-y-0"
          dataSource={filteredCourses}
          renderItem={(course) => {
            const state = getCourseState(course);
            return (
              <ListItemCard cursor="pointer">
                <div className="min-w-0 flex-1">
                  <div className="flex w-full flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="m-0 text-lg font-semibold text-stone-900 dark:text-stone-100">
                        <SearchHighlight
                          text={course.title}
                          searchQuery={searchQuery}
                        />
                      </h4>
                      <Tag color={getLevelColor(course.level)}>
                        {getLevelText(course.level)}
                      </Tag>
                      {currentStudyingCourse?.id === course.id && (
                        <Badge
                          count="正在学习"
                          className="[&_.ant-badge-count]:!bg-amber-500"
                        />
                      )}
                    </div>
                    {course.description ? (
                      <p className="m-0 line-clamp-2 text-sm text-stone-500 dark:text-stone-400">
                        <SearchHighlight
                          text={course.description}
                          searchQuery={searchQuery}
                        />
                      </p>
                    ) : null}
                    {course.tags.length > 0 && (
                      <Space wrap>
                        {course.tags.map((tag) => (
                          <Tag key={tag}>
                            <SearchHighlight
                              text={tag}
                              searchQuery={searchQuery}
                            />
                          </Tag>
                        ))}
                      </Space>
                    )}
                  </div>
                </div>
                <Space className="shrink-0">
                  {state === 0 && (
                    <Button
                      icon={<BookOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleAddToStudyList(course);
                      }}
                      className="rounded-xl"
                    >
                      添加到学习
                    </Button>
                  )}
                  {state === 1 && (
                    <>
                      <Button
                        type="primary"
                        icon={<StarOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleSetCurrentStudying(course);
                        }}
                        className="rounded-xl shadow-sm"
                      >
                        开始学习
                      </Button>
                      <Button
                        icon={<CloseOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleRemoveFromStudyList(course);
                        }}
                        className="rounded-xl"
                      />
                    </>
                  )}
                  {state === 2 && (
                    <Button
                      icon={<StarOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleEndStudying(course);
                      }}
                      className="rounded-xl"
                    >
                      结束学习
                    </Button>
                  )}
                  {isAdmin ? (
                    <>
                      <Button
                        icon={<EditOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          void navigate(`/courses/edit/${String(course.id)}`);
                        }}
                        className="rounded-xl"
                      />
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCourse(course.id);
                        }}
                        className="rounded-xl"
                      />
                    </>
                  ) : null}
                </Space>
              </ListItemCard>
            );
          }}
        />
      )}
    </div>
  );
};

export default CourseList;
