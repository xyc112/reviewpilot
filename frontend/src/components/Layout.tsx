import { Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { LogOut, User, LayoutDashboard, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "../stores";
import { useTheme, Sidebar } from "./index";
import { useGlobalShortcuts } from "../hooks";

const Layout = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { theme, toggleTheme } = useTheme();
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
    void navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background/80">
      <Sidebar />
      <div className={isMobile ? "" : "ml-[260px]"}>
        <header className="sticky top-0 z-[100] flex h-16 items-center justify-between border-b border-border bg-card/90 px-6 shadow-sm backdrop-blur-md md:px-8">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <LayoutDashboard className="size-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
              ReviewPilot
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={toggleTheme}
              title={theme === "light" ? "切换到暗色模式" : "切换到亮色模式"}
            >
              {theme === "light" ? (
                <Moon className="size-5" />
              ) : (
                <Sun className="size-5" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 transition-colors hover:bg-muted"
                >
                  <Avatar className="size-8 bg-primary text-primary-foreground">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
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
        <main className="mx-auto my-6 min-h-[280px] max-w-[1400px] w-full px-4 md:my-8 md:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
