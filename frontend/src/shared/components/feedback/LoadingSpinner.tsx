import { Loader2 } from "lucide-react";

const LoadingSpinner = () => {
  return (
    <div className="flex min-h-[280px] items-center justify-center px-8 py-16">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="size-10 animate-spin text-primary" aria-hidden />
        <span
          className="text-sm font-medium text-muted-foreground"
          aria-label="加载中"
        >
          加载中…
        </span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
