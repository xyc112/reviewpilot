import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Typography, Alert, Space, Card } from "antd";
import {
  UserOutlined,
  LockOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "../stores";
import { authAPI } from "../services";
import { validateUsername, validatePassword } from "../utils";

const { Title, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (values: {
    username: string;
    password: string;
  }) => {
    setLoading(true);
    setError("");

    try {
      const response = await authAPI.login(values);
      const user = response.data;
      login(user);
      navigate("/");
    } catch (err: any) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "登录失败，请检查用户名和密码";
      setError(errorMessage);
      console.error("登录错误:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      {/* 左侧欢迎区域 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2.5rem",
          color: "white",
        }}
        className="auth-welcome-section"
      >
        <div style={{ maxWidth: 500, position: "relative", zIndex: 1 }}>
          <div style={{ marginBottom: "1.5rem", fontSize: "4rem" }}>✓</div>
          <Title level={1} style={{ color: "white", marginBottom: "0.75rem" }}>
            欢迎来到 ReviewPilot
          </Title>
          <Text
            style={{
              fontSize: "1.125rem",
              opacity: 0.95,
              display: "block",
              marginBottom: "2rem",
            }}
          >
            一体化复习平台，让学习更高效，让复习更系统
          </Text>
          <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
            <div
              style={{
                display: "flex",
                gap: "0.875rem",
                padding: "0.875rem",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "0.75rem",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <div style={{ fontSize: "1.75rem", flexShrink: 0 }}>📚</div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: "0.2rem" }}>
                  课程与知识图谱
                </div>
                <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>
                  管理课程，可视化知识关联
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: "0.875rem",
                padding: "0.875rem",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "0.75rem",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <div style={{ fontSize: "1.75rem", flexShrink: 0 }}>📝</div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: "0.2rem" }}>
                  笔记与测验
                </div>
                <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>
                  记录笔记，检验学习成果
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: "0.875rem",
                padding: "0.875rem",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "0.75rem",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <div style={{ fontSize: "1.75rem", flexShrink: 0 }}>📅</div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: "0.2rem" }}>
                  复习计划与社区
                </div>
                <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>
                  制定计划，交流学习心得
                </div>
              </div>
            </div>
          </Space>
        </div>
      </div>

      {/* 右侧表单区域 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem",
          background: "#fafaf9",
        }}
      >
        <Card
          style={{
            width: "100%",
            maxWidth: 450,
            borderRadius: 16,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
          }}
        >
          <Title
            level={2}
            style={{
              textAlign: "center",
              marginBottom: "0.5rem",
              fontWeight: 600,
            }}
          >
            登录
          </Title>
          <Text
            type="secondary"
            style={{
              display: "block",
              textAlign: "center",
              marginBottom: "2.5rem",
              fontSize: 14,
            }}
          >
            请登录继续访问学习辅助系统
          </Text>

          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="username"
              label="用户名"
              rules={[
                { required: true, message: "用户名不能为空" },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    const error = validateUsername(value);
                    return error
                      ? Promise.reject(new Error(error))
                      : Promise.resolve();
                  },
                },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: "密码不能为空" },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    const error = validatePassword(value);
                    return error
                      ? Promise.reject(new Error(error))
                      : Promise.resolve();
                  },
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
              />
            </Form.Item>

            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                style={{ marginBottom: "1.5rem" }}
              />
            )}

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                icon={<ArrowRightOutlined />}
                size="large"
                style={{ height: 48, borderRadius: 8, fontWeight: 500 }}
              >
                登录
              </Button>
            </Form.Item>
          </Form>

          <div
            style={{
              marginTop: "2rem",
              textAlign: "center",
              fontSize: "0.875rem",
            }}
          >
            <Text type="secondary">没有账号？</Text>{" "}
            <Link to="/register" style={{ fontWeight: 500 }}>
              立即注册
            </Link>
          </div>
        </Card>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .auth-welcome-section {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
