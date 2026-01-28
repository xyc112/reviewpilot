import { List, theme } from "antd";
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
  const { token } = theme.useToken();
  const baseStyle: React.CSSProperties = {
    background: token.colorBgContainer,
    marginBottom: token.margin,
    padding: token.paddingLG,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadow,
    transition: `box-shadow ${token.motionDurationMid} ${token.motionEaseOut}, transform ${token.motionDurationMid} ${token.motionEaseOut}`,
    cursor,
  };

  return (
    <List.Item
      style={baseStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = token.boxShadowSecondary;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = token.boxShadow;
        e.currentTarget.style.transform = "translateY(0)";
      }}
      onClick={onClick}
    >
      {children}
    </List.Item>
  );
};

export default ListItemCard;
