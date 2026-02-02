import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Card,
  Button,
  Space,
  Typography,
  Tag,
  Alert,
  Spin,
  Statistic,
  Row,
  Col,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  UserOutlined,
  BarChartOutlined,
  FileTextOutlined,
  UnorderedListOutlined,
  MessageOutlined,
  BookOutlined,
} from "@ant-design/icons";
import type { Course } from "../types";
import { courseAPI, noteAPI, quizAPI, postAPI } from "../services";
import { useAuthStore, useCourseStore } from "../stores";
import { ConfirmDialog, useToast } from "../components";
import { getErrorMessage } from "../utils";

const { Title, Text } = Typography;

const CourseOverview = () => {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";
  const currentStudyingCourse = useCourseStore(
    (state) => state.currentStudyingCourse,
  );
  const { success, error: showError } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [stats, setStats] = useState<{
    noteCount: number;
    quizCount: number;
    postCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourseData(Number(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchCourseData 依赖 id
  }, [id]);

  const fetchCourseData = async (courseId: number) => {
    try {
      setLoading(true);
      const courseRes = await courseAPI.getCourse(courseId);
      setCourse(courseRes.data);

      // 获取统计信息
      try {
        const [notesRes, quizzesRes, postsRes] = await Promise.all([
          noteAPI.getNotes(courseId).catch(() => ({ data: [] })),
          quizAPI.getQuizzes(courseId).catch(() => ({ data: [] })),
          postAPI.getPosts(courseId).catch(() => ({ data: [] })),
        ]);

        setStats({
          noteCount: notesRes.data.length,
          quizCount: quizzesRes.data.length,
          postCount: postsRes.data.length,
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    } catch (err: unknown) {
      setError("获取课程信息失败");
      showError("获取课程信息失败: " + getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!course) return;
    try {
      await courseAPI.deleteCourse(course.id);
      success("课程删除成功");
      window.location.href = "/courses";
    } catch (err: unknown) {
      const errorMsg =
        "删除课程失败: " + (getErrorMessage(err) || "无权限");
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setDeleteConfirm(false);
    }
  };

  const getLevelText = (level: string) => {
    const levels = {
      BEGINNER: "初级",
      INTERMEDIATE: "中级",
      ADVANCED: "高级",
    };
    return levels[level as keyof typeof levels] || level;
  };

  const getLevelColor = (level: string): string => {
    const colors: Record<string, string> = {
      BEGINNER: "green",
      INTERMEDIATE: "orange",
      ADVANCED: "red",
    };
    return colors[level] || "default";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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

  if (!course) {
    return (
      <Alert
        message="课程不存在"
        type="error"
        showIcon
        style={{ margin: "2rem" }}
      />
    );
  }

  const canEdit = isAdmin || user?.id === course.authorId;
  const isCurrentCourse = currentStudyingCourse?.id === course.id;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1rem" }}>
      <ConfirmDialog
        isOpen={deleteConfirm}
        title="删除课程"
        message="确定要删除这个课程吗？此操作不可撤销，将删除课程及其所有相关内容（笔记、测验、知识图谱等）。"
        confirmText="删除"
        cancelText="取消"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => { setDeleteConfirm(false); }}
      />

      <Space orientation="vertical" size="large" style={{ width: "100%" }}>
        <Card>
          <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              {isCurrentCourse ? <Tag color="gold" icon={<BookOutlined />}>
                  当前学习课程
                </Tag> : null}
              {canEdit ? <Space>
                  <Link to={`/courses/edit/${course.id}`}>
                    <Button icon={<EditOutlined />}>编辑课程</Button>
                  </Link>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleDelete}
                  >
                    删除课程
                  </Button>
                </Space> : null}
            </div>

            <Space wrap>
              <Space>
                <BarChartOutlined />
                <Tag color={getLevelColor(course.level)}>
                  {getLevelText(course.level)}
                </Tag>
              </Space>
              <Space>
                <CalendarOutlined />
                <Text type="secondary">{formatDate(course.createdAt)}</Text>
              </Space>
              {course.authorId ? <Space>
                  <UserOutlined />
                  <Text type="secondary">作者 ID: {course.authorId}</Text>
                </Space> : null}
            </Space>

            <div>
              <Title level={4}>课程简介</Title>
              <Text style={{ whiteSpace: "pre-wrap" }}>
                {course.description || "暂无描述"}
              </Text>
            </div>

            {course.tags.length > 0 && (
              <Space wrap>
                {course.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Space>
            )}

            {/* 统计信息卡片 */}
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="笔记数量"
                    value={stats?.noteCount ?? 0}
                    prefix={<FileTextOutlined style={{ color: "#1890ff" }} />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="测验数量"
                    value={stats?.quizCount ?? 0}
                    prefix={
                      <UnorderedListOutlined style={{ color: "#52c41a" }} />
                    }
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="帖子数量"
                    value={stats?.postCount ?? 0}
                    prefix={<MessageOutlined style={{ color: "#722ed1" }} />}
                  />
                </Card>
              </Col>
            </Row>
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default CourseOverview;
