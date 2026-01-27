import React, { useState } from "react";

interface GroupPanelProps {
  title: string;
  children: React.ReactNode;
  initiallyExpanded?: boolean;
  showCount?: boolean;
  count?: number;
}

const GroupPanel: React.FC<GroupPanelProps> = ({
  title,
  children,
  initiallyExpanded = true,
  showCount = false,
  count = 0,
}) => {
  const [expanded, setExpanded] = useState(initiallyExpanded);

  return (
    <div className="group-panel">
      <div
        className="group-panel-header"
        onClick={() => setExpanded(!expanded)}
        style={{
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3>
          {title}
          {showCount && <span className="count-badge">({count})</span>}
        </h3>
        <span
          className={`expand-icon ${expanded ? "expanded" : ""}`}
          style={{ transition: "transform 0.2s" }}
        >
          ▼
        </span>
      </div>
      {expanded && <div className="group-panel-content">{children}</div>}
    </div>
  );
};

export default GroupPanel;
