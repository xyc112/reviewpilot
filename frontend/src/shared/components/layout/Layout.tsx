import { Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { LogOut, User, LayoutDashboard } from "lucide-react";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useAuthStore } from "@/shared/stores";
import { useGlobalShortcuts } from "@/shared/hooks";
import Sidebar from "./Sidebar";

const Layout = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
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

  useGlobalShortcuts();

  const handleLogout = () => {
    logout();
    void navigate("/");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* 与落地页一致的背景：网格 + 渐变光晕 */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_0.5px,transparent_0.5px),linear-gradient(to_bottom,var(--border)_0.5px,transparent_0.5px)] bg-[size:4rem_4rem]"
          style={{ opacity: 0.5 }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,var(--primary)/10%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_85%_50%,var(--chart-2)/6%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_15%_85%,var(--primary)/5%,transparent_50%)]" />
      </div>
      <Sidebar />
      <div className={isMobile ? "" : "ml-[260px]"}>
        <header className="sticky top-0 z-[100] flex h-16 items-center justify-between border-b border-border/80 bg-card/90 px-6 shadow-sm backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LayoutDashboard className="size-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
              Nexus
            </span>
          </div>
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 transition-colors hover:bg-muted"
                >
                  <Avatar className="size-8 bg-primary text-primary-foreground">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                      {(user?.username ?? "?").slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden font-medium text-foreground sm:inline">
                    {user?.username}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem disabled>
                  <User className="mr-2 size-4" />
                  个人资料
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 size-4" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="page-container mx-auto my-6 min-h-[280px] w-full md:my-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
