import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  Typography,
  Select,
  Alert,
  Spin,
} from "antd";
import { Course } from "../types";
import { courseAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const { TextArea } = Input;
const { Title } = Typography;

const EditCourse: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
    level: "BEGINNER",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    if (id) {
      fetchCourse(Number(id));
    }
  }, [id]);

  const fetchCourse = async (courseId: number) => {
    try {
      const response = await courseAPI.getCourse(courseId);
      const courseData = response.data;
      setCourse(courseData);

      setFormData({
        title: courseData.title,
        description: courseData.description || "",
        tags: courseData.tags.join(", "),
        level: courseData.level,
      });
    } catch (err: any) {
      setError("获取课程详情失败");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    setSaving(true);
    setError("");

    try {
      const courseData = {
        title: formData.title,
        description: formData.description,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        level: formData.level,
      };

      await courseAPI.updateCourse(course.id, courseData);
      navigate(`/courses/${course.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "更新课程失败");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error && !course) {
    return (
      <Alert message={error} type="error" showIcon style={{ margin: "2rem" }} />
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

  if (!canEdit) {
    return (
      <Alert
        message="无权限编辑此课程"
        type="warning"
        showIcon
        style={{ margin: "2rem" }}
      />
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 1rem" }}>
      <Card>
        <Title level={2}>编辑课程</Title>
        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="课程标题"
            name="title"
            rules={[{ required: true, message: "请输入课程标题" }]}
          >
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
          </Form.Item>

          <Form.Item label="课程描述" name="description">
            <TextArea
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Form.Item>

          <Form.Item
            label="标签 (用逗号分隔)"
            name="tags"
            extra="例如: 数学, 基础, 入门"
          >
            <Input
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="例如: 数学, 基础, 入门"
            />
          </Form.Item>

          <Form.Item label="难度等级" name="level">
            <Select
              name="level"
              value={formData.level}
              onChange={(value) => setFormData({ ...formData, level: value })}
            >
              <Select.Option value="BEGINNER">初级</Select.Option>
              <Select.Option value="INTERMEDIATE">中级</Select.Option>
              <Select.Option value="ADVANCED">高级</Select.Option>
            </Select>
          </Form.Item>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ marginBottom: "1rem" }}
            />
          )}

          <Form.Item>
            <Space>
              <Button onClick={() => navigate(-1)}>取消</Button>
              <Button type="primary" htmlType="submit" loading={saving}>
                保存更改
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EditCourse;
