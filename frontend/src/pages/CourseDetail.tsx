import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Card,
  Button,
  Space,
  Typography,
  Tag,
  Alert,
  Spin,
  Divider,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  UserOutlined,
  BarChartOutlined,
  ArrowLeftOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { Course } from "../types";
import { courseAPI } from "../services";
import { useAuthStore } from "../stores";
import { ConfirmDialog, useToast } from "../components";

const { Title, Text, Paragraph } = Typography;

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";
  const { success, error: showError } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourse(Number(id));
    }
  }, [id]);

  const fetchCourse = async (courseId: number) => {
    try {
      const response = await courseAPI.getCourse(courseId);
      setCourse(response.data);
    } catch (err: any) {
      setError("获取课程详情失败");
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
      navigate("/courses");
    } catch (err: any) {
      const errorMsg =
        "删除课程失败: " + (err.response?.data?.message || "无权限");
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );

  if (error)
    return (
      <Alert message={error} type="error" showIcon style={{ margin: "2rem" }} />
    );

  if (!course)
    return (
      <Alert
        message="课程不存在"
        type="error"
        showIcon
        style={{ margin: "2rem" }}
      />
    );

  const canEdit = isAdmin || user?.id === course.authorId;

  const getLevelColor = (level: string): string => {
    const colors: Record<string, string> = {
      BEGINNER: "green",
      INTERMEDIATE: "orange",
      ADVANCED: "red",
    };
    return colors[level] || "default";
  };

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
        onCancel={() => setDeleteConfirm(false)}
      />

      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/courses")}
        >
          返回课程列表
        </Button>

        <Card
          style={{
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {canEdit && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.5rem",
                }}
              >
                <Link to={`/courses/edit/${course.id}`}>
                  <Button icon={<EditOutlined />}>编辑课程</Button>
                </Link>
                <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
                  删除课程
                </Button>
              </div>
            )}

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
              {course.authorId && (
                <Space>
                  <UserOutlined />
                  <Text type="secondary">作者 ID: {course.authorId}</Text>
                </Space>
              )}
            </Space>

            <div>
              <Title level={4}>课程简介</Title>
              <Paragraph>{course.description || "暂无描述"}</Paragraph>
            </div>

            {course.tags.length > 0 && (
              <Space wrap>
                {course.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Space>
            )}

            <Divider />

            <Link to={`/courses/${course.id}/community`}>
              <Button type="primary" icon={<MessageOutlined />}>
                进入课程社区
              </Button>
            </Link>
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default CourseDetail;
