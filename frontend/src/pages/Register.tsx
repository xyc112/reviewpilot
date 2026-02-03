import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormErrorMessage } from "@/components/feedback";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/routes";
import { authAPI } from "../services";
import { useAuthStore } from "../stores";
import { getErrorMessage, validatePassword, validateUsername } from "../utils";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("USER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const userError = validateUsername(username);
  const passError = validatePassword(password);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (userError ?? passError) {
      setError(userError ?? passError ?? "");
      setShakeKey((k) => k + 1);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await authAPI.register({ username, password, role });
      login(response.data);
      void navigate(ROUTES.COURSES);
    } catch (err: unknown) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setError(getErrorMessage(err) || "注册失败，请稍后重试");
      setShakeKey((k) => k + 1);
      console.error("注册错误:", err);
    } finally {
      setLoading(false);
    }
  };

  const showUserError = Boolean(error && userError);
  const showPassError = Boolean(error && passError);

  return (
    <div className="relative min-h-screen overflow-hidden bg-landing-bg">
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,var(--landing-border)_0.5px,transparent_0.5px),linear-gradient(to_bottom,var(--landing-border)_0.5px,transparent_0.5px)] bg-[size:4rem_4rem]"
          style={{ opacity: 0.6 }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,var(--primary)/12%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_50%,var(--chart-2)/8%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_20%_80%,var(--primary)/5%,transparent_50%)]" />
      </div>

      <LandingHeader />

      <main className="flex min-h-screen flex-col items-center justify-center px-6 py-24">
        <div className="mx-auto flex w-full max-w-[480px] flex-col items-center text-center lg:max-w-[900px] lg:flex-row lg:items-center lg:gap-16 lg:text-left">
          <div className="mb-10 lg:mb-0 lg:flex-1">
            <h1 className="mb-4 text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-5xl">
              创建账号
            </h1>
            <p className="max-w-md text-base text-muted-foreground md:text-lg">
              课程 · 笔记 · 测验 · 图谱 — 一站式学习管理
            </p>
          </div>

          <Card className="w-full max-w-[400px] shrink-0 rounded-2xl border border-landing-border/80 bg-landing-card/95 shadow-xl backdrop-blur-sm lg:max-w-[420px]">
            <CardHeader className="space-y-1 pb-6 pt-8">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                开始使用
              </h2>
              <p className="text-sm text-muted-foreground">
                填写信息即可创建账号
              </p>
            </CardHeader>
            <CardContent className="pb-8">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSubmit(e);
                }}
                className="space-y-5"
              >
                <div
                  key={shakeKey}
                  className={cn(
                    "space-y-5",
                    (showUserError || showPassError) && "animate-input-shake",
                  )}
                >
                  <div className="space-y-2">
                    <Label htmlFor="username">用户名</Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                      }}
                      autoComplete="username"
                      className="h-11 rounded-xl"
                      aria-invalid={showUserError}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">密码（至少 6 位）</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                      }}
                      autoComplete="new-password"
                      className="h-11 rounded-xl"
                      aria-invalid={showPassError}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-foreground">
                    角色
                  </Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger id="role" className="h-11 w-full rounded-xl">
                      <SelectValue placeholder="选择角色" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">普通用户</SelectItem>
                      <SelectItem value="ADMIN">管理员</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {error ? <FormErrorMessage message={error} /> : null}
                <Button
                  type="submit"
                  size="lg"
                  className="h-11 w-full rounded-xl font-medium"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="opacity-80">注册中…</span>
                  ) : (
                    <>
                      注册
                      <ArrowRight className="ml-2 size-4" aria-hidden />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Register;
