import { useState, useEffect } from "react";
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
import type { Course } from "../types";
import { courseAPI } from "../services";
import { useAuthStore } from "../stores";
import { useToast } from "../components";
import { getErrorMessage } from "../utils";

const { TextArea } = Input;
const { Title } = Typography;

const EditCourse = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";
  const { success, error: showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    if (id) {
      void fetchCourse(Number(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchCourse 依赖 id
  }, [id]);

  const fetchCourse = async (courseId: number) => {
    try {
      const response = await courseAPI.getCourse(courseId);
      const courseData = response.data;
      setCourse(courseData);

      // 设置表单初始值
      form.setFieldsValue({
        title: courseData.title,
        description: courseData.description || "",
        tags: courseData.tags.join(", "),
        level: courseData.level,
      });
    } catch {
      setError("获取课程详情失败");
      showError("获取课程详情失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: {
    title: string;
    description: string;
    tags: string;
    level: string;
  }) => {
    if (!course) return;

    setSaving(true);
    setError("");

    try {
      const courseData = {
        title: values.title,
        description: values.description || "",
        tags: values.tags
          ? values.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag)
          : [],
        level: values.level,
      };

      await courseAPI.updateCourse(course.id, courseData);
      success("课程更新成功");
      void navigate(`/courses/${String(course.id)}`);
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err) || "更新课程失败";
      setError(errorMsg);
      showError(errorMsg);
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
      <Alert title={error} type="error" showIcon style={{ margin: "2rem" }} />
    );
  }

  if (!course) {
    return (
      <Alert
        title="课程不存在"
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
        title="无权限编辑此课程"
        type="warning"
        showIcon
        style={{ margin: "2rem" }}
      />
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 1rem" }}>
      <Card
        style={{
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Title level={2} style={{ marginBottom: "1.5rem" }}>
          编辑课程
        </Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={(values: {
            title: string;
            description: string;
            tags: string;
            level: string;
          }) => {
            void handleSubmit(values);
          }}
          size="large"
        >
          <Form.Item
            label="课程标题"
            name="title"
            rules={[
              { required: true, message: "请输入课程标题" },
              { max: 100, message: "标题不能超过100个字符" },
            ]}
          >
            <Input placeholder="请输入课程标题" />
          </Form.Item>

          <Form.Item
            label="课程描述"
            name="description"
            rules={[{ max: 500, message: "描述不能超过500个字符" }]}
          >
            <TextArea
              rows={4}
              placeholder="请输入课程描述"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            label="标签"
            name="tags"
            extra="多个标签请用逗号分隔，例如: 数学, 基础, 入门"
          >
            <Input placeholder="例如: 数学, 基础, 入门" />
          </Form.Item>

          <Form.Item
            label="难度等级"
            name="level"
            rules={[{ required: true, message: "请选择难度等级" }]}
          >
            <Select
              placeholder="请选择难度等级"
              options={[
                { value: "BEGINNER", label: "初级" },
                { value: "INTERMEDIATE", label: "中级" },
                { value: "ADVANCED", label: "高级" },
              ]}
            />
          </Form.Item>

          {error ? (
            <Alert
              title={error}
              type="error"
              showIcon
              style={{ marginBottom: "1rem" }}
              closable={{
                onClose: () => {
                  setError("");
                },
              }}
            />
          ) : null}

          <Form.Item style={{ marginBottom: 0, marginTop: "1.5rem" }}>
            <Space>
              <Button
                onClick={() => {
                  void navigate(-1);
                }}
                size="large"
              >
                取消
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={saving}
                size="large"
              >
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
