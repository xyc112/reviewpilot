const LoadingSpinner = () => {
  return (
    <div className="flex min-h-[280px] items-center justify-center px-8 py-16">
      <div
        className="h-10 w-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin dark:border-blue-900/50 dark:border-t-blue-400"
        aria-label="加载中"
      />
    </div>
  );
};

export default LoadingSpinner;
