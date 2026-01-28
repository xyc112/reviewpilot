import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Input,
  Button,
  Space,
  Typography,
  Card,
  List,
  Empty,
  Alert,
  Tag,
  Spin,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Quiz } from "../types";
import { quizAPI } from "../services";
import { useAuthStore } from "../stores/authStore";
import { useCourseStore } from "../stores/courseStore";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../components/Toast";

const { Search } = Input;
const { Title, Text, Paragraph } = Typography;

const QuizList: React.FC = () => {
  const navigate = useNavigate();
  const selectedCourse = useCourseStore((state) => state.selectedCourse);
  const currentStudyingCourse = useCourseStore((state) => state.currentStudyingCourse);
  const course = selectedCourse || currentStudyingCourse;
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
      navigate("/courses");
      return;
    }
    fetchQuizzes();
  }, [course, navigate]);

  const fetchQuizzes = async () => {
    if (!course) return;
    try {
      const response = await quizAPI.getQuizzes(course.id);
      setQuizzes(response.data);
    } catch (err: any) {
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
      fetchQuizzes();
    } catch (err: any) {
      const errorMsg =
        "删除测验失败: " + (err.response?.data?.message || "未知错误");
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
        message="请先选择一个课程"
        type="warning"
        showIcon
        action={
          <Button type="primary" onClick={() => navigate("/courses")}>
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
      <Alert message={error} type="error" showIcon style={{ margin: "2rem" }} />
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1rem" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {course && isAdmin && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Link to="/quizzes/new">
              <Button type="primary" icon={<PlusOutlined />}>
                创建测验
              </Button>
            </Link>
          </div>
        )}

        <Search
          placeholder="搜索测验标题..."
          allowClear
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: 600 }}
        />

        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          title="删除测验"
          message="确定要删除这个测验吗？此操作无法撤销，将删除测验及其所有相关数据。"
          confirmText="删除"
          cancelText="取消"
          type="danger"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm({ isOpen: false, quizId: null })}
        />

        {quizzes.length === 0 ? (
          <Empty
            image={
              <FileTextOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />
            }
            description={
              <Space direction="vertical" size="small">
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
          >
            {isAdmin && course && (
              <Link to="/quizzes/new">
                <Button type="primary" icon={<PlusOutlined />}>
                  创建新测验
                </Button>
              </Link>
            )}
          </Empty>
        ) : filteredQuizzes.length === 0 && searchQuery ? (
          <Empty
            image={
              <FileTextOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />
            }
            description={
              <Space direction="vertical" size="small">
                <Title level={4} style={{ margin: 0 }}>
                  未找到匹配的测验
                </Title>
                <Text type="secondary">尝试调整搜索条件</Text>
              </Space>
            }
          >
            <Button type="primary" onClick={() => setSearchQuery("")}>
              清除搜索
            </Button>
          </Empty>
        ) : (
          <List
            dataSource={filteredQuizzes}
            renderItem={(quiz) => (
              <List.Item
                style={{
                  background: "#fff",
                  marginBottom: "1rem",
                  padding: "1.5rem",
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.12)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <Space
                  style={{ width: "100%", justifyContent: "space-between" }}
                >
                  <Space direction="vertical" size="small" style={{ flex: 1 }}>
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
                    {isAdmin && (
                      <>
                        <Button
                          icon={<EditOutlined />}
                          onClick={() => navigate(`/quizzes/edit/${quiz.id}`)}
                          title="编辑测验"
                        />
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDelete(quiz.id)}
                          title="删除测验"
                        />
                      </>
                    )}
                  </Space>
                </Space>
              </List.Item>
            )}
          />
        )}
      </Space>
    </div>
  );
};

export default QuizList;
