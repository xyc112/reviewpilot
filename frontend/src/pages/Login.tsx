import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Alert, Space, Card } from "antd";
import {
  UserOutlined,
  LockOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "../stores";
import { authAPI } from "../services";
import { validateUsername, validatePassword, getErrorMessage } from "../utils";

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
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800">
      {/* 左侧欢迎区域 - 小屏隐藏 */}
      <div className="hidden flex-1 items-center justify-center p-12 text-white lg:flex">
        <div className="relative z-10 max-w-[480px]">
          <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-3xl shadow-lg backdrop-blur-sm">
            ✓
          </div>
          <h1 className="m-0 mb-4 text-3xl font-bold tracking-tight text-white drop-shadow-sm md:text-4xl">
            欢迎来到 ReviewPilot
          </h1>
          <p className="mb-10 block text-lg leading-relaxed text-white/95">
            一体化复习平台，让学习更高效，让复习更系统
          </p>
          <Space orientation="vertical" size="middle" className="w-full">
            <div className="flex gap-4 rounded-xl border border-white/20 bg-white/10 p-4 shadow-sm backdrop-blur-sm transition-colors hover:bg-white/15">
              <div className="shrink-0 text-2xl">📚</div>
              <div>
                <div className="mb-1 font-semibold text-white">
                  课程与知识图谱
                </div>
                <div className="text-sm text-white/90">
                  管理课程，可视化知识关联
                </div>
              </div>
            </div>
            <div className="flex gap-4 rounded-xl border border-white/20 bg-white/10 p-4 shadow-sm backdrop-blur-sm transition-colors hover:bg-white/15">
              <div className="shrink-0 text-2xl">📝</div>
              <div>
                <div className="mb-1 font-semibold text-white">笔记与测验</div>
                <div className="text-sm text-white/90">
                  记录笔记，检验学习成果
                </div>
              </div>
            </div>
            <div className="flex gap-4 rounded-xl border border-white/20 bg-white/10 p-4 shadow-sm backdrop-blur-sm transition-colors hover:bg-white/15">
              <div className="shrink-0 text-2xl">📅</div>
              <div>
                <div className="mb-1 font-semibold text-white">
                  复习计划与社区
                </div>
                <div className="text-sm text-white/90">
                  制定计划，交流学习心得
                </div>
              </div>
            </div>
          </Space>
        </div>
      </div>

      {/* 右侧表单区域 */}
      <div className="flex flex-1 items-center justify-center bg-stone-50/95 p-8 dark:bg-neutral-900/95 md:p-12">
        <Card className="w-full max-w-[420px] rounded-2xl border-0 shadow-2xl shadow-stone-200/50 dark:shadow-black/30 [&_.ant-card-body]:p-8">
          <h2 className="mb-1 text-center text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
            登录
          </h2>
          <p className="mb-8 block text-center text-sm text-stone-500 dark:text-stone-400">
            请登录继续访问学习辅助系统
          </p>

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
              label={
                <span className="font-medium text-stone-700 dark:text-stone-300">
                  用户名
                </span>
              }
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
              label={
                <span className="font-medium text-stone-700 dark:text-stone-300">
                  密码
                </span>
              }
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
              <Alert
                title={error}
                type="error"
                showIcon
                className="mb-6 rounded-lg"
              />
            ) : null}

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                icon={<ArrowRightOutlined />}
                size="large"
                className="h-12 rounded-xl font-medium shadow-md"
              >
                登录
              </Button>
            </Form.Item>
          </Form>

          <div className="mt-8 text-center text-sm text-stone-500 dark:text-stone-400">
            <span>没有账号？</span>{" "}
            <Link
              to="/register"
              className="font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
            >
              立即注册
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
