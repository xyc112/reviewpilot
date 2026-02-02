import { Skeleton as AntSkeleton, Card } from "antd";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  active?: boolean;
}

const Skeleton = ({
  width = "100%",
  height = 16,
  className = "",
  active = true,
}: SkeletonProps) => {
  return (
    <AntSkeleton.Button
      active={active}
      style={{ width, height }}
      className={`rounded-lg ${className}`.trim()}
    />
  );
};

interface SkeletonGridProps {
  count?: number;
}

const SkeletonGrid = ({ count = 3 }: SkeletonGridProps) => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          className="rounded-xl border border-stone-200/80 shadow-sm dark:border-neutral-700/80 dark:bg-neutral-900 [&_.ant-card-body]:p-6"
        >
          <AntSkeleton
            active
            paragraph={{ rows: 3 }}
            title={{ width: "60%" }}
            className="[&_.ant-skeleton-content]:space-y-3 [&_.ant-skeleton-title]:rounded [&_.ant-skeleton-paragraph>li]:rounded"
          />
          <div className="mt-5 flex gap-2">
            <AntSkeleton.Button
              active
              size="small"
              className="min-w-20 w-20 rounded-xl"
            />
            <AntSkeleton.Button
              active
              size="small"
              className="min-w-20 w-20 rounded-xl"
            />
          </div>
        </Card>
      ))}
    </div>
  );
};

export { Skeleton, SkeletonGrid };
