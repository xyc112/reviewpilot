import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

export interface ListItemCardProps {
  children: ReactNode;
  onClick?: () => void;
  cursor?: "pointer" | "default";
  className?: string;
}

const ListItemCard = ({
  children,
  onClick,
  cursor = onClick ? "pointer" : "default",
  className,
}: ListItemCardProps) => {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        "rounded-xl border border-border/90 bg-card/95 px-5 py-4 shadow-sm backdrop-blur-sm transition-all duration-200 ease-out",
        "hover:border-primary/25 hover:shadow-md",
        cursor === "pointer" ? "cursor-pointer" : "cursor-default",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default ListItemCard;
