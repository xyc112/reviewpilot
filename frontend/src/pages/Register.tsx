import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Typography,
  Alert,
  Space,
  Card,
  Select,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  SafetyOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "../stores";
import { authAPI } from "../services";
import { validateUsername, validatePassword, getErrorMessage } from "../utils";

const { Title, Text } = Typography;

const Register = () => {
  const [form] = Form.useForm();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (values: {
    username: string;
    password: string;
    role: string;
  }) => {
    setLoading(true);
    setError("");

    try {
      const response = await authAPI.register(values);
      login(response.data);
      void navigate("/");
    } catch (err: unknown) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      const errorMessage = getErrorMessage(err) || "注册失败，请稍后重试";
      setError(errorMessage);
      console.error("注册错误:", err);
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
      {!isMobile && (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2.5rem",
            color: "white",
          }}
        >
          <div style={{ maxWidth: 500, position: "relative", zIndex: 1 }}>
            <div style={{ marginBottom: "1.5rem", fontSize: "4rem" }}>🚀</div>
            <Title
              level={1}
              style={{ color: "white", marginBottom: "0.75rem" }}
            >
              加入我们
            </Title>
            <Text
              style={{
                fontSize: "1.125rem",
                opacity: 0.95,
                display: "block",
                marginBottom: "2rem",
              }}
            >
              开启您的学习之旅
              <br />
              与知识同行，与成长相伴
            </Text>
            <Space
              orientation="vertical"
              size="middle"
              style={{ width: "100%" }}
            >
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
                <div style={{ fontSize: "1.75rem", flexShrink: 0 }}>🎓</div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: "0.2rem" }}>
                    个性化学习路径
                  </div>
                  <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>
                    根据您的需求定制学习计划
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
                <div style={{ fontSize: "1.75rem", flexShrink: 0 }}>📊</div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: "0.2rem" }}>
                    学习进度追踪
                  </div>
                  <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>
                    实时了解学习成果
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
                <div style={{ fontSize: "1.75rem", flexShrink: 0 }}>🤝</div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: "0.2rem" }}>
                    社区互动交流
                  </div>
                  <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>
                    与学习者共同进步
                  </div>
                </div>
              </div>
            </Space>
          </div>
        </div>
      )}

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
            创建账号
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
            欢迎加入学习辅助系统
          </Text>

          <Form
            form={form}
            onFinish={(values: {
              username: string;
              password: string;
              role: string;
            }) => {
              void handleSubmit(values);
            }}
            layout="vertical"
            size="large"
            initialValues={{ role: "USER" }}
          >
            <Form.Item
              name="username"
              label="用户名"
              rules={[
                { required: true, message: "用户名不能为空" },
                {
                  validator: (_, value: string) => {
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
                  validator: (_, value: string) => {
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

            <Form.Item name="role" label="角色">
              <Select
                prefix={<SafetyOutlined />}
                options={[
                  { label: "普通用户", value: "USER" },
                  { label: "管理员", value: "ADMIN" },
                ]}
              />
            </Form.Item>

            {error ? (
              <Alert
                title={error}
                type="error"
                showIcon
                style={{ marginBottom: "1.5rem" }}
              />
            ) : null}

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
                注册
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
            <Text type="secondary">已有账号？</Text>{" "}
            <Link to="/login" style={{ fontWeight: 500 }}>
              立即登录
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

export default Register;
