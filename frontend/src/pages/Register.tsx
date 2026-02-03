import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Lock,
  ArrowRight,
  Rocket,
  GraduationCap,
  BarChart3,
  Users,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "../stores";
import { authAPI } from "../services";
import { validateUsername, validatePassword, getErrorMessage } from "../utils";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("USER");
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
      const response = await authAPI.register({ username, password, role });
      login(response.data);
      void navigate("/");
    } catch (err: unknown) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setError(getErrorMessage(err) || "注册失败，请稍后重试");
      console.error("注册错误:", err);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: GraduationCap,
      title: "个性化学习路径",
      desc: "根据您的需求定制学习计划",
    },
    { icon: BarChart3, title: "学习进度追踪", desc: "实时了解学习成果" },
    { icon: Users, title: "社区互动交流", desc: "与学习者共同进步" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* 左侧品牌区 */}
      <div className="relative hidden w-[48%] flex-shrink-0 flex-col justify-between overflow-hidden bg-primary p-12 lg:flex">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,oklch(0.55_0.22_264/0.4)_0%,transparent_50%),linear-gradient(180deg,transparent_60%,oklch(0.35_0.2_264/0.3)_100%)]" />
        <div className="relative z-10">
          <div className="mb-10 flex size-14 items-center justify-center rounded-2xl bg-primary-foreground/15 shadow-lg">
            <Rocket className="size-7 text-primary-foreground" />
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-primary-foreground drop-shadow-sm md:text-4xl">
            加入 ReviewPilot
          </h1>
          <p className="max-w-sm text-lg leading-relaxed text-primary-foreground/90">
            开启您的学习之旅，与知识同行，与成长相伴
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
              创建账号
            </h2>
            <p className="text-sm text-muted-foreground">
              欢迎加入，填写以下信息即可开始使用
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
              <div className="space-y-2">
                <Label className="text-foreground">角色</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="选择角色" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">普通用户</SelectItem>
                    <SelectItem value="ADMIN">管理员</SelectItem>
                  </SelectContent>
                </Select>
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
                  <span className="opacity-80">注册中…</span>
                ) : (
                  <>
                    注册
                    <ArrowRight className="ml-2 size-4" />
                  </>
                )}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              已有账号？{" "}
              <Link
                to="/login"
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                立即登录
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
