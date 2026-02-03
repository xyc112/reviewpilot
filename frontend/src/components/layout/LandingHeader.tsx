import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { ROUTES } from "@/routes";
import { cn } from "@/lib/utils";

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
        "fixed left-0 right-0 top-0 z-50 flex h-16 items-center bg-landing-bg/80 backdrop-blur-xl",
        hideBorder
          ? "border-b border-transparent"
          : "border-b border-landing-border/40",
        className,
      )}
    >
      <div className="page-container flex w-full items-center justify-between">
        <Link
          to={ROUTES.LANDING}
          className="flex items-center gap-2 rounded-lg transition-opacity hover:opacity-90"
        >
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-5" aria-hidden />
          </div>
          <span className="text-base font-semibold tracking-tight text-foreground md:text-lg">
            Nexus
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to={ROUTES.LOGIN}
            className="rounded-full border border-foreground/20 bg-landing-bg px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-foreground/40 hover:bg-landing-border/50"
          >
            登录
          </Link>
          <Link
            to={ROUTES.REGISTER}
            className="rounded-full border border-landing-bg/30 bg-foreground px-3.5 py-1.5 text-xs font-medium text-landing-bg transition-colors hover:bg-foreground/90"
          >
            注册
          </Link>
        </div>
      </div>
    </header>
  );
}
