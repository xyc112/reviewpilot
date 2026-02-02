import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Space, Typography, List, Alert, Tag, Spin } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import type { Quiz } from "../types";
import { quizAPI } from "../services";
import { useAuthStore, useCourseStore } from "../stores";
import {
  ConfirmDialog,
  useToast,
  SearchBox,
  ListEmptyState,
  ListItemCard,
} from "../components";
import { getErrorMessage } from "../utils";

const { Title, Text } = Typography;

const QuizList = () => {
  const navigate = useNavigate();
  const selectedCourse = useCourseStore((state) => state.selectedCourse);
  const currentStudyingCourse = useCourseStore(
    (state) => state.currentStudyingCourse,
  );
  const course = selectedCourse ?? currentStudyingCourse;
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";
  const { success, error: showError } = useToast();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    quizId: string | null;
  }>({
    isOpen: false,
    quizId: null,
  });

  useEffect(() => {
    if (!course) {
      void navigate("/courses");
      return;
    }
    void fetchQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchQuizzes 依赖 course
  }, [course, navigate]);

  const fetchQuizzes = async () => {
    if (!course) return;
    try {
      const response = await quizAPI.getQuizzes(course.id);
      setQuizzes(response.data);
    } catch {
      setError("获取测验列表失败");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (quizId: string) => {
    setDeleteConfirm({ isOpen: true, quizId });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.quizId) return;
    if (!course) return;
    try {
      await quizAPI.deleteQuiz(course.id, deleteConfirm.quizId);
      success("测验删除成功");
      void fetchQuizzes();
    } catch (err: unknown) {
      const errorMsg = "删除测验失败: " + (getErrorMessage(err) || "未知错误");
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setDeleteConfirm({ isOpen: false, quizId: null });
    }
  };

  // 过滤测验
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((quiz) => {
      // 搜索过滤
      const matchesSearch =
        !searchQuery ||
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [quizzes, searchQuery]);

  if (!course) {
    return (
      <Alert
        title="请先选择一个课程"
        type="warning"
        showIcon
        action={
          <Button
            type="primary"
            onClick={() => {
              void navigate("/courses");
            }}
          >
            前往课程列表
          </Button>
        }
        style={{ margin: "2rem" }}
      />
    );
  }

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert title={error} type="error" showIcon style={{ margin: "2rem" }} />
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1rem" }}>
      <Space orientation="vertical" size="large" style={{ width: "100%" }}>
        {isAdmin ? (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Link to="/quizzes/new">
              <Button type="primary" icon={<PlusOutlined />}>
                创建测验
              </Button>
            </Link>
          </div>
        ) : null}

        <SearchBox
          placeholder="搜索测验标题..."
          value={searchQuery}
          onChange={setSearchQuery}
        />

        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          title="删除测验"
          message="确定要删除这个测验吗？此操作无法撤销，将删除测验及其所有相关数据。"
          confirmText="删除"
          cancelText="取消"
          type="danger"
          onConfirm={() => {
            void confirmDelete();
          }}
          onCancel={() => {
            setDeleteConfirm({ isOpen: false, quizId: null });
          }}
        />

        {quizzes.length === 0 ? (
          <ListEmptyState
            variant="empty"
            icon={
              <FileTextOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />
            }
            description={
              <Space orientation="vertical" size="small">
                <Title level={4} style={{ margin: 0 }}>
                  暂无测验
                </Title>
                <Text type="secondary">
                  {isAdmin
                    ? "立即创建第一个测验吧！"
                    : "请等待管理员创建测验。"}
                </Text>
              </Space>
            }
            action={
              isAdmin ? (
                <Link to="/quizzes/new">
                  <Button type="primary" icon={<PlusOutlined />}>
                    创建新测验
                  </Button>
                </Link>
              ) : undefined
            }
          />
        ) : filteredQuizzes.length === 0 ? (
          <ListEmptyState
            variant="noResults"
            icon={
              <FileTextOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />
            }
            description={
              <Space orientation="vertical" size="small">
                <Title level={4} style={{ margin: 0 }}>
                  未找到匹配的测验
                </Title>
                <Text type="secondary">尝试调整搜索条件</Text>
              </Space>
            }
            onClearFilter={() => {
              setSearchQuery("");
            }}
            clearFilterLabel="清除搜索"
          />
        ) : (
          <List
            dataSource={filteredQuizzes}
            renderItem={(quiz) => (
              <ListItemCard>
                <Space
                  style={{ width: "100%", justifyContent: "space-between" }}
                >
                  <Space
                    orientation="vertical"
                    size="small"
                    style={{ flex: 1 }}
                  >
                    <Space wrap>
                      <Title
                        level={4}
                        style={{ margin: 0, fontSize: "1.125rem" }}
                      >
                        {quiz.title}
                      </Title>
                      <Tag color="blue">{quiz.questions.length} 题</Tag>
                    </Space>
                    <Text type="secondary" style={{ fontSize: "0.875rem" }}>
                      包含 {quiz.questions.length}{" "}
                      道题目，测试您对课程知识的掌握程度
                    </Text>
                  </Space>
                  <Space>
                    <Link to={`/quizzes/${quiz.id}`}>
                      <Button type="primary">开始测验</Button>
                    </Link>
                    {isAdmin ? (
                      <>
                        <Button
                          icon={<EditOutlined />}
                          onClick={() => {
                            void navigate(`/quizzes/edit/${quiz.id}`);
                          }}
                          title="编辑测验"
                        />
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => {
                            handleDelete(quiz.id);
                          }}
                          title="删除测验"
                          type="button"
                        />
                      </>
                    ) : null}
                  </Space>
                </Space>
              </ListItemCard>
            )}
          />
        )}
      </Space>
    </div>
  );
};

export default QuizList;
