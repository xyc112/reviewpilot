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
import { validateUsername, validatePassword, getErrorMessage } from "../utils";

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
      void navigate("/");
    } catch (err: unknown) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      const errorMessage =
        getErrorMessage(err) || "登录失败，请检查用户名和密码";
      setError(errorMessage);
      console.error("登录错误:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)]">
      {/* 左侧欢迎区域 - 小屏隐藏 */}
      <div className="hidden flex-1 items-center justify-center p-10 text-white lg:flex">
        <div className="relative z-10 max-w-[500px]">
          <div className="mb-6 text-6xl">✓</div>
          <Title level={1} className="!m-0 !mb-3 !text-white">
            欢迎来到 ReviewPilot
          </Title>
          <Text className="mb-8 block text-lg opacity-95">
            一体化复习平台，让学习更高效，让复习更系统
          </Text>
          <Space orientation="vertical" size="middle" className="w-full">
            <div className="flex gap-3.5 rounded-xl border border-white/20 bg-white/10 p-3.5">
              <div className="shrink-0 text-[1.75rem]">📚</div>
              <div>
                <div className="mb-0.5 font-semibold">课程与知识图谱</div>
                <div className="text-sm opacity-90">
                  管理课程，可视化知识关联
                </div>
              </div>
            </div>
            <div className="flex gap-3.5 rounded-xl border border-white/20 bg-white/10 p-3.5">
              <div className="shrink-0 text-[1.75rem]">📝</div>
              <div>
                <div className="mb-0.5 font-semibold">笔记与测验</div>
                <div className="text-sm opacity-90">记录笔记，检验学习成果</div>
              </div>
            </div>
            <div className="flex gap-3.5 rounded-xl border border-white/20 bg-white/10 p-3.5">
              <div className="shrink-0 text-[1.75rem]">📅</div>
              <div>
                <div className="mb-0.5 font-semibold">复习计划与社区</div>
                <div className="text-sm opacity-90">制定计划，交流学习心得</div>
              </div>
            </div>
          </Space>
        </div>
      </div>

      {/* 右侧表单区域 */}
      <div className="flex flex-1 items-center justify-center bg-[#fafaf9] p-12">
        <Card className="w-full max-w-[450px] rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
          <Title level={2} className="!mb-2 !text-center font-semibold">
            登录
          </Title>
          <Text type="secondary" className="mb-10 block text-center text-sm">
            请登录继续访问学习辅助系统
          </Text>

          <Form
            form={form}
            onFinish={(values: { username: string; password: string }) => {
              void handleSubmit(values);
            }}
            layout="vertical"
            size="large"
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

            {error ? (
              <Alert title={error} type="error" showIcon className="mb-6" />
            ) : null}

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                icon={<ArrowRightOutlined />}
                size="large"
                className="h-12 rounded-lg font-medium"
              >
                登录
              </Button>
            </Form.Item>
          </Form>

          <div className="mt-8 text-center text-sm">
            <Text type="secondary">没有账号？</Text>{" "}
            <Link to="/register" className="font-medium">
              立即注册
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
