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

const { TextArea } = Input;
const { Title } = Typography;

const CreateCourse = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
    level: "BEGINNER",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";

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
    setLoading(true);
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

      await courseAPI.createCourse(courseData);
      navigate("/courses");
    } catch (err: any) {
      setError(err.response?.data?.message || "创建课程失败");
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
      <Card>
        <Title level={2}>创建新课程</Title>
        <Form
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={formData}
        >
          <Form.Item
            label="课程标题"
            name="title"
            rules={[{ required: true, message: "请输入课程标题" }]}
          >
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </Form.Item>

          <Form.Item label="课程描述" name="description">
            <TextArea
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </Form.Item>

          <Form.Item
            label="标签 (用逗号分隔)"
            name="tags"
            extra="例如: 数学, 基础, 入门"
          >
            <Input
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              placeholder="例如: 数学, 基础, 入门"
            />
          </Form.Item>

          <Form.Item label="难度等级" name="level">
            <Select
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
              <Button type="primary" htmlType="submit" loading={loading}>
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
