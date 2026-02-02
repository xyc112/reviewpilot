import { List } from "antd";
import type { ReactNode } from "react";

export interface ListItemCardProps {
  children: ReactNode;
  /** 点击整卡回调，可选 */
  onClick?: () => void;
  /** 是否显示手型指针，默认根据 onClick 是否存在 */
  cursor?: "pointer" | "default";
}

const ListItemCard = ({
  children,
  onClick,
  cursor = onClick ? "pointer" : "default",
}: ListItemCardProps) => {
  return (
    <List.Item
      className={
        "mb-4 rounded-xl border border-stone-200/80 bg-white px-6 py-5 shadow-sm transition-all duration-200 ease-out " +
        "hover:-translate-y-0.5 hover:border-stone-300/80 hover:shadow-md " +
        "dark:border-neutral-700/80 dark:bg-neutral-900 dark:shadow-none dark:hover:border-neutral-600 dark:hover:shadow-lg dark:hover:shadow-black/20 " +
        (cursor === "pointer" ? "cursor-pointer" : "cursor-default")
      }
      onClick={onClick}
    >
      {children}
    </List.Item>
  );
};

export default ListItemCard;
