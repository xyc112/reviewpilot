import { useState, type ReactNode } from "react";

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
  const [expanded, setExpanded] = useState(initiallyExpanded);

  return (
    <div>
      <div
        onClick={() => {
          setExpanded(!expanded);
        }}
        className="flex cursor-pointer items-center justify-between"
      >
        <h3 className="m-0">
          {title}
          {showCount ? <span className="ml-1">({count})</span> : null}
        </h3>
        <span
          className="inline-block transition-transform duration-200 ease-in-out"
          style={{ transform: expanded ? "rotate(0deg)" : "rotate(-90deg)" }}
        >
          ▼
        </span>
      </div>
      {expanded ? <div>{children}</div> : null}
    </div>
  );
};

export default GroupPanel;
