import { Outlet, useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { LogOut, User as UserIcon } from "lucide-react";
import { ROUTES } from "@/shared/config/routes";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";
import { useAuthStore } from "@/shared/stores";
import { useGlobalShortcuts } from "@/shared/hooks";
import { profileAPI } from "@/shared/api";
import Sidebar from "./Sidebar";

const Layout = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const loadAvatar = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await profileAPI.getProfile();
      if (res.data.hasAvatar) {
        const url = await profileAPI.getAvatarUrl();
        setAvatarUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url ?? null;
        });
      }
    } catch {
      // 未登录或接口失败时忽略
    }
  }, [user?.id]);

  useEffect(() => {
    const id = setTimeout(() => {
      void loadAvatar();
    }, 0);
    const onAvatarUpdated = () => {
      void loadAvatar();
    };
    window.addEventListener("avatar-updated", onAvatarUpdated);
    return () => {
      clearTimeout(id);
      window.removeEventListener("avatar-updated", onAvatarUpdated);
      setAvatarUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [loadAvatar]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useGlobalShortcuts();

  const handleLogout = () => {
    logout();
    void navigate("/");
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_0.5px,transparent_0.5px),linear-gradient(to_bottom,var(--border)_0.5px,transparent_0.5px)] bg-[size:4rem_4rem]"
          style={{ opacity: 0.45 }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,var(--primary)/10%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_85%_50%,var(--chart-2)/6%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_15%_85%,var(--primary)/5%,transparent_50%)]" />
      </div>
      <Sidebar />
      <div
        className={cn(
          "flex flex-1 flex-col min-h-0",
          !isMobile && "ml-[220px]",
        )}
      >
        <main className="page-container mx-auto flex flex-1 min-h-0 w-full flex-col overflow-hidden px-5 py-4 md:px-6 md:py-5">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <Outlet />
          </div>
        </main>
      </div>
      {/* 右上角用户头像，点击：修改个人信息 / 退出登录 */}
      {user ? (
        <div
          className={cn(
            "fixed top-3 right-3 z-50",
            isMobile && "top-14 right-3",
          )}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex cursor-pointer items-center rounded-full ring-2 ring-border/80 transition hover:ring-primary/50 focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="用户菜单"
              >
                <Avatar className="size-9 border-2 border-background bg-primary text-primary-foreground shadow-md">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt={user.username} />
                  ) : null}
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                    {(user.username || "?").slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-xl">
              <DropdownMenuItem asChild>
                <Link to={ROUTES.PROFILE}>
                  <UserIcon className="mr-2 size-4" />
                  修改个人信息
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                <LogOut className="mr-2 size-4" />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : null}
    </div>
  );
};

export default Layout;
