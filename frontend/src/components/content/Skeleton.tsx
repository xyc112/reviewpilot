import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton as SkeletonPrimitive } from "@/components/ui/skeleton";

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
    <SkeletonPrimitive
      data-active={active}
      className={`rounded-lg ${className}`.trim()}
      style={{ width, height }}
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
        <Card key={index} className="rounded-xl border border-border shadow-sm">
          <CardHeader>
            <SkeletonPrimitive className="h-5 w-[60%] rounded" />
          </CardHeader>
          <CardContent className="space-y-3">
            <SkeletonPrimitive className="h-4 w-full rounded" />
            <SkeletonPrimitive className="h-4 w-full rounded" />
            <SkeletonPrimitive className="h-4 w-4/5 rounded" />
          </CardContent>
          <div className="mt-5 flex gap-2 px-6 pb-6">
            <SkeletonPrimitive className="h-8 w-20 rounded-xl" />
            <SkeletonPrimitive className="h-8 w-20 rounded-xl" />
          </div>
        </Card>
      ))}
    </div>
  );
};

export { Skeleton, SkeletonGrid };
