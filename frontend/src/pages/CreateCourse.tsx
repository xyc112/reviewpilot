import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  Typography,
  Select,
  Alert,
} from "antd";
import { courseAPI } from "../services";
import { useAuthStore } from "../stores";
import { useToast } from "../components";
import { getErrorMessage } from "../utils";

const { TextArea } = Input;
const { Title } = Typography;

const CreateCourse = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";
  const { success, error: showError } = useToast();

  const handleSubmit = async (values: {
    title: string;
    description: string;
    tags: string;
    level: string;
  }) => {
    setLoading(true);
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

      await courseAPI.createCourse(courseData);
      success("课程创建成功");
      navigate("/courses");
    } catch (err: unknown) {
      const errorMsg =
        getErrorMessage(err) || "创建课程失败";
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <Alert
        message="无权限访问此页面"
        type="error"
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
          创建新课程
        </Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            level: "BEGINNER",
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
            <Select placeholder="请选择难度等级">
              <Select.Option value="BEGINNER">初级</Select.Option>
              <Select.Option value="INTERMEDIATE">中级</Select.Option>
              <Select.Option value="ADVANCED">高级</Select.Option>
            </Select>
          </Form.Item>

          {error ? <Alert
              message={error}
              type="error"
              showIcon
              style={{ marginBottom: "1rem" }}
              closable
              onClose={() => { setError(""); }}
            /> : null}

          <Form.Item style={{ marginBottom: 0, marginTop: "1.5rem" }}>
            <Space>
              <Button onClick={() => navigate(-1)} size="large">
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading} size="large">
                创建课程
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateCourse;
