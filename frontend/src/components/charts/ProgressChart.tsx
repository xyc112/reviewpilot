interface ProgressChartProps {
  completed: number;
  total: number;
  size?: number;
  strokeWidth?: number;
}

/** 根据进度百分比返回主题 chart 变量（与 shadcn 主题一致） */
function getProgressChartVar(percent: number): string {
  if (percent >= 80) return "var(--chart-4)";
  if (percent >= 60) return "var(--chart-2)";
  if (percent >= 40) return "var(--chart-3)";
  return "var(--chart-1)";
}

/**
 * 圆形进度图组件（SVG，使用主题变量）
 */
export const CircularProgressChart = ({
  completed,
  total,
  size = 120,
  strokeWidth = 12,
}: ProgressChartProps) => {
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getProgressChartVar(percentage)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 0.5s ease, stroke 0.3s ease",
          }}
        />
      </svg>
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
        style={{ width: size, height: size, lineHeight: `${String(size)}px` }}
      >
        <span className="text-2xl font-bold text-foreground">
          {Math.round(percentage)}%
        </span>
        <br />
        <span className="text-xs text-muted-foreground">
          {completed}/{total}
        </span>
      </div>
    </div>
  );
};

interface BarChartProps {
  data: { label: string; value: number; color: string }[];
  height?: number;
}

/**
 * 简单的柱状图组件（使用主题变量或传入的 color 如 var(--chart-1)）
 */
export const SimpleBarChart = ({ data, height = 200 }: BarChartProps) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end gap-2 py-4" style={{ height }}>
      {data.map((item, index) => (
        <div key={index} className="flex flex-1 flex-col items-center gap-2">
          <div
            className="flex w-full min-h-[4px] items-end justify-center rounded-t pb-1 transition-[height] duration-500 ease-out"
            style={{
              height:
                item.value > 0 ? (item.value / maxValue) * (height - 60) : 0,
              backgroundColor: item.color,
            }}
          >
            {item.value > 0 ? (
              <span className="text-xs font-semibold text-white">
                {item.value}
              </span>
            ) : null}
          </div>
          <span className="text-xs text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

interface ScoreDistributionProps {
  scores: { score: number; count: number }[];
}

/**
 * 分数分布图（柱状图，使用主题 chart 变量）
 */
export const ScoreDistributionChart = ({ scores }: ScoreDistributionProps) => {
  const ranges = [
    { label: "0-59", min: 0, max: 59, color: "var(--chart-1)" },
    { label: "60-69", min: 60, max: 69, color: "var(--chart-3)" },
    { label: "70-79", min: 70, max: 79, color: "var(--chart-2)" },
    { label: "80-89", min: 80, max: 89, color: "var(--chart-4)" },
    { label: "90-100", min: 90, max: 100, color: "var(--chart-5)" },
  ];

  const distribution = ranges.map((range) => ({
    label: range.label,
    value: scores.filter((s) => s.score >= range.min && s.score <= range.max)
      .length,
    color: range.color,
  }));

  return <SimpleBarChart data={distribution} height={150} />;
};
