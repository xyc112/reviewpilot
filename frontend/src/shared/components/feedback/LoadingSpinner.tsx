import { Loader2 } from "lucide-react";

const LoadingSpinner = () => {
  return (
    <div className="flex min-h-[280px] items-center justify-center px-8 py-16">
      <Loader2
        className="size-10 animate-spin text-primary"
        aria-label="加载中"
      />
    </div>
  );
};

export default LoadingSpinner;
