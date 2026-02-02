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
        "mb-4 rounded-xl bg-white px-6 py-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] " +
        "transition-all duration-200 ease-out hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 " +
        "dark:bg-[#141414] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.25)] " +
        (cursor === "pointer" ? "cursor-pointer" : "cursor-default")
      }
      onClick={onClick}
    >
      {children}
    </List.Item>
  );
};

export default ListItemCard;
