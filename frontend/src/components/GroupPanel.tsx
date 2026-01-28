import { useState, type ReactNode } from "react";
import { theme } from "antd";

interface GroupPanelProps {
  title: string;
  children: ReactNode;
  initiallyExpanded?: boolean;
  showCount?: boolean;
  count?: number;
}

const GroupPanel = ({
  title,
  children,
  initiallyExpanded = true,
  showCount = false,
  count = 0,
}: GroupPanelProps) => {
  const { token } = theme.useToken();
  const [expanded, setExpanded] = useState(initiallyExpanded);

  return (
    <div>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ margin: 0 }}>
          {title}
          {showCount && <span style={{ marginLeft: token.marginXXS }}>({count})</span>}
        </h3>
        <span
          style={{
            transition: `transform ${token.motionDurationMid} ${token.motionEaseInOut}`,
            transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
            display: "inline-block",
          }}
        >
          ▼
        </span>
      </div>
      {expanded && <div>{children}</div>}
    </div>
  );
};

export default GroupPanel;
