import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Button,
  Tag,
  Space,
  Typography,
  List,
  Alert,
  Badge,
} from "antd";
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

const { Title, Text, Paragraph } = Typography;

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
    fetchCourses();
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
      const errorMsg =
        "移除课程失败: " + (getErrorMessage(err) || "未知错误");
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
      const errorMsg =
        "结束学习失败: " + (getErrorMessage(err) || "未知错误");
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
      fetchCourses();
    } catch (err: unknown) {
      const errorMsg =
        "删除课程失败: " + (getErrorMessage(err) || "未知错误");
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
    return levels[level] || level;
  };

  const getLevelColor = (level: string): string => {
    const colors: Record<string, string> = {
      BEGINNER: "green",
      INTERMEDIATE: "orange",
      ADVANCED: "red",
    };
    return colors[level] || "default";
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
        course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      <Alert title={error} type="error" showIcon style={{ margin: "2rem" }} />
    );
  }

  return (
    <div style={{ padding: "0", maxWidth: 1400, margin: "0 auto" }}>
      {isAdmin ? <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "1.5rem",
          }}
        >
          <Link to="/courses/new">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              style={{ borderRadius: 8, fontWeight: 500 }}
            >
              创建新课程
            </Button>
          </Link>
        </div> : null}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="删除课程"
        message="确定要删除这个课程吗？此操作不可撤销，将删除课程及其所有相关内容。"
        confirmText="删除"
        cancelText="取消"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => { setDeleteConfirm({ isOpen: false, courseId: null }); }}
      />

      {/* 搜索和过滤栏 */}
      <Space
        orientation="vertical"
        size="middle"
        style={{ width: "100%", marginBottom: "1.5rem" }}
      >
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
              <div>
                <Text strong style={{ marginRight: "0.5rem" }}>
                  标签：
                </Text>
                <Space wrap>
                  {allTags.map((tag) => (
                    <Tag
                      key={tag}
                      color={selectedTags.has(tag) ? "blue" : "default"}
                      onClick={() => { toggleTag(tag); }}
                      style={{ cursor: "pointer" }}
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
              ? `找到 ${filteredCourses.length} 个课程（共 ${courses.length} 个）`
              : undefined
          }
        />
      </Space>

      {/* 课程列表 */}
      {courses.length === 0 ? (
        <ListEmptyState
          variant="empty"
          icon={<BookOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />}
          description={
            <span>
              还没有创建任何课程，
              {isAdmin ? "立即创建第一个课程吧！" : "请等待管理员创建课程。"}
            </span>
          }
          action={
            isAdmin ? (
              <Link to="/courses/new">
                <Button type="primary" icon={<PlusOutlined />}>
                  创建新课程
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : filteredCourses.length === 0 ? (
        <ListEmptyState
          variant="noResults"
          icon={<SearchOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />}
          description="未找到匹配的课程，尝试调整搜索条件或筛选器"
          onClearFilter={clearFilters}
          clearFilterLabel="清除所有筛选"
        />
      ) : (
        <List
          dataSource={filteredCourses}
          renderItem={(course) => {
            const state = getCourseState(course);
            return (
              <ListItemCard cursor="pointer">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Space
                    orientation="vertical"
                    size="small"
                    style={{ width: "100%" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <Title
                        level={4}
                        style={{ margin: 0, fontSize: "1.125rem" }}
                      >
                        <SearchHighlight
                          text={course.title}
                          searchQuery={searchQuery}
                        />
                      </Title>
                      <Tag color={getLevelColor(course.level)}>
                        {getLevelText(course.level)}
                      </Tag>
                      {currentStudyingCourse?.id === course.id && (
                        <Badge
                          count="正在学习"
                          style={{ backgroundColor: "#faad14" }}
                        />
                      )}
                    </div>
                    {course.description ? <Paragraph
                        ellipsis={{ rows: 2, expandable: false }}
                        style={{
                          margin: 0,
                          fontSize: "0.875rem",
                          color: "#78716c",
                        }}
                      >
                        <SearchHighlight
                          text={course.description}
                          searchQuery={searchQuery}
                        />
                      </Paragraph> : null}
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
                  </Space>
                </div>
                <Space style={{ flexShrink: 0 }}>
                  {state === 0 && (
                    <Button
                      icon={<BookOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToStudyList(course);
                      }}
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
                          handleSetCurrentStudying(course);
                        }}
                      >
                        开始学习
                      </Button>
                      <Button
                        icon={<CloseOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromStudyList(course);
                        }}
                      />
                    </>
                  )}
                  {state === 2 && (
                    <Button
                      icon={<StarOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEndStudying(course);
                      }}
                    >
                      结束学习
                    </Button>
                  )}
                  {isAdmin ? <>
                      <Button
                        icon={<EditOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/courses/edit/${course.id}`);
                        }}
                      />
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCourse(course.id);
                        }}
                      />
                    </> : null}
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
