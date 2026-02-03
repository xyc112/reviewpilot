import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Lock, ArrowRight } from "lucide-react";
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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800">
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
          <div className="flex w-full flex-col gap-4">
            {[
              {
                emoji: "📚",
                title: "课程与知识图谱",
                desc: "管理课程，可视化知识关联",
              },
              {
                emoji: "📝",
                title: "笔记与测验",
                desc: "记录笔记，检验学习成果",
              },
              {
                emoji: "📅",
                title: "复习计划与社区",
                desc: "制定计划，交流学习心得",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex gap-4 rounded-xl border border-white/20 bg-white/10 p-4 shadow-sm backdrop-blur-sm transition-colors hover:bg-white/15"
              >
                <div className="shrink-0 text-2xl">{item.emoji}</div>
                <div>
                  <div className="mb-1 font-semibold text-white">
                    {item.title}
                  </div>
                  <div className="text-sm text-white/90">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-background/95 p-8 md:p-12">
        <Card className="w-full max-w-[420px] rounded-2xl border-0 shadow-2xl shadow-stone-200/50 dark:shadow-black/30">
          <CardHeader className="pb-2">
            <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground">
              登录
            </h2>
            <p className="block text-center text-sm text-muted-foreground">
              请登录继续访问学习辅助系统
            </p>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSubmit(e);
              }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="font-medium text-foreground"
                >
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
                <Label
                  htmlFor="password"
                  className="font-medium text-foreground"
                >
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
                className="h-12 w-full rounded-xl font-medium shadow-md"
                disabled={loading}
              >
                <ArrowRight className="size-4" />
                登录
              </Button>
            </form>
            <p className="mt-8 text-center text-sm text-muted-foreground">
              <span>没有账号？</span>{" "}
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
