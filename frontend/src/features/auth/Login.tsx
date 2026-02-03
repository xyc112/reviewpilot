import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { FormErrorMessage } from "@/shared/components/feedback";
import { LandingHeader } from "@/shared/components/layout/LandingHeader";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";
import { ROUTES } from "@/shared/config/routes";
import { authAPI } from "@/shared/api";
import { useAuthStore } from "@/shared/stores";
import {
  getErrorMessage,
  validatePassword,
  validateUsername,
} from "@/shared/utils";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
      const response = await authAPI.login({ username, password });
      const { user, token } = response.data;
      login({ ...user, token });
      void navigate(ROUTES.COURSES);
    } catch (err: unknown) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setError(getErrorMessage(err) || "用户名或密码错误");
      setShakeKey((k) => k + 1);
      console.error("登录错误:", err);
    } finally {
      setLoading(false);
    }
  };

  const showUserError = Boolean(error && userError);
  const showPassError = Boolean(error && passError);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-landing-bg">
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,var(--landing-border)_0.5px,transparent_0.5px),linear-gradient(to_bottom,var(--landing-border)_0.5px,transparent_0.5px)] bg-[size:4rem_4rem]"
          style={{ opacity: 0.6 }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,var(--primary)/12%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_50%,var(--chart-2)/8%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_20%_80%,var(--primary)/5%,transparent_50%)]" />
      </div>

      <LandingHeader hideBorder />

      <main className="flex flex-1 flex-col items-center justify-center px-6 min-h-0">
        <div className="mx-auto flex w-full max-w-[480px] flex-col items-center text-center lg:max-w-[900px] lg:flex-row lg:items-center lg:gap-16 lg:text-left">
          <div className="mb-8 lg:mb-0 lg:flex-1">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              欢迎回来
            </h1>
            <p className="text-muted-foreground">登录以继续</p>
          </div>

          <Card className="w-full max-w-[400px] shrink-0 rounded-2xl border border-landing-border/80 bg-landing-card/95 shadow-lg backdrop-blur-sm lg:max-w-[420px]">
            <CardHeader className="pb-4 pt-6">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                登录
              </h2>
            </CardHeader>
            <CardContent className="p-6 pt-0 sm:p-8 sm:pt-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSubmit(e);
                }}
                className="space-y-4"
              >
                <div
                  key={shakeKey}
                  className={cn(
                    "space-y-4",
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
                      placeholder="请输入登录用户名"
                      autoComplete="username"
                      className="h-11 rounded-xl"
                      aria-invalid={showUserError}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">密码</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                      }}
                      placeholder="请输入登录密码"
                      autoComplete="current-password"
                      className="h-11 rounded-xl"
                      aria-invalid={showPassError}
                    />
                  </div>
                </div>
                {error ? <FormErrorMessage message={error} /> : null}
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 w-full rounded-xl font-medium"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="opacity-80">登录中…</span>
                  ) : (
                    <>
                      登录
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

export default Login;
