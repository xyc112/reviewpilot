import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/utils";

interface LandingHeaderProps {
  /** 落地页为 true 时隐藏分隔线 */
  hideBorder?: boolean;
  className?: string;
}

export function LandingHeader({
  hideBorder = false,
  className,
}: LandingHeaderProps) {
  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 flex h-16 items-center",
        hideBorder
          ? "border-b border-transparent bg-landing-bg"
          : "border-b border-landing-border/40 bg-landing-bg/70 backdrop-blur-xl",
        className,
      )}
    >
      <div className="page-container flex w-full items-center justify-between">
        <Link
          to={ROUTES.LANDING}
          className="flex items-center gap-2.5 rounded-xl transition-all hover:opacity-90 active:scale-[0.98]"
        >
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-5" aria-hidden />
          </div>
          <span className="text-base font-bold tracking-tight text-foreground md:text-lg">
            Nexus
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            to={ROUTES.LOGIN}
            className="rounded-xl border border-foreground/20 bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground/40 hover:bg-landing-border/40"
          >
            登录
          </Link>
          <Link
            to={ROUTES.REGISTER}
            className="rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-landing-bg shadow-sm transition-all hover:bg-foreground/90 active:scale-[0.98]"
          >
            注册
          </Link>
        </nav>
      </div>
    </header>
  );
}
