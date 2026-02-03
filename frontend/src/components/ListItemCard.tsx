import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ListItemCardProps {
  children: ReactNode;
  onClick?: () => void;
  cursor?: "pointer" | "default";
}

const ListItemCard = ({
  children,
  onClick,
  cursor = onClick ? "pointer" : "default",
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
        "mb-4 rounded-xl border border-border bg-card px-6 py-5 shadow-sm transition-all duration-200 ease-out",
        "hover:-translate-y-0.5 hover:border-border hover:shadow-md",
        "dark:hover:shadow-lg dark:hover:shadow-black/20",
        cursor === "pointer" ? "cursor-pointer" : "cursor-default",
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default ListItemCard;
