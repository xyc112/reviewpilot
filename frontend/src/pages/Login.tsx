import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Lock,
  ArrowRight,
  BookOpen,
  FileText,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "../stores";
import { authAPI } from "../services";
import { validateUsername, validatePassword, getErrorMessage } from "../utils";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const userError = validateUsername(username);
    const passError = validatePassword(password);
    if (userError || passError) {
      setError(userError ?? passError ?? "");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await authAPI.login({ username, password });
      login(response.data);
      void navigate("/");
    } catch (err: unknown) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setError(getErrorMessage(err) || "登录失败，请检查用户名和密码");
      console.error("登录错误:", err);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: BookOpen,
      title: "课程与知识图谱",
      desc: "管理课程，可视化知识关联",
    },
    {
      icon: FileText,
      title: "笔记与测验",
      desc: "记录笔记，检验学习成果",
    },
    {
      icon: Calendar,
      title: "复习计划与社区",
      desc: "制定计划，交流学习心得",
    },
  ];

  return (
    <div className="flex min-h-screen">
      {/* 左侧品牌区：固定靛蓝主题 */}
      <div className="relative hidden w-[48%] flex-shrink-0 flex-col justify-between overflow-hidden bg-primary p-12 lg:flex">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,oklch(0.55_0.22_264/0.4)_0%,transparent_50%),linear-gradient(180deg,transparent_60%,oklch(0.35_0.2_264/0.3)_100%)]" />
        <div className="relative z-10">
          <div className="mb-10 flex size-14 items-center justify-center rounded-2xl bg-primary-foreground/15 shadow-lg">
            <Sparkles className="size-7 text-primary-foreground" />
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-primary-foreground drop-shadow-sm md:text-4xl">
            欢迎回来
          </h1>
          <p className="max-w-sm text-lg leading-relaxed text-primary-foreground/90">
            一体化复习平台，让学习更高效，让复习更系统
          </p>
        </div>
        <div className="relative z-10 flex flex-col gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex gap-4 rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 p-4 backdrop-blur-sm transition-colors hover:bg-primary-foreground/15"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15">
                <Icon className="size-5 text-primary-foreground" />
              </div>
              <div>
                <div className="mb-0.5 font-semibold text-primary-foreground">
                  {title}
                </div>
                <div className="text-sm text-primary-foreground/85">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 右侧表单区 */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12 md:px-12">
        <Card className="w-full max-w-[400px] rounded-2xl border border-border shadow-lg">
          <CardHeader className="space-y-1 pb-4 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              登录
            </h2>
            <p className="text-sm text-muted-foreground">
              使用账号登录继续使用 ReviewPilot
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSubmit(e);
              }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground">
                  用户名
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="请输入用户名"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                    }}
                    className="h-11 pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  密码
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                    className="h-11 pl-9"
                  />
                </div>
              </div>
              {error ? (
                <Alert variant="destructive" className="rounded-lg">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              <Button
                type="submit"
                className="h-11 w-full font-medium"
                disabled={loading}
              >
                {loading ? (
                  <span className="opacity-80">登录中…</span>
                ) : (
                  <>
                    登录
                    <ArrowRight className="ml-2 size-4" />
                  </>
                )}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              还没有账号？{" "}
              <Link
                to="/register"
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                立即注册
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
