import { Component, type ErrorInfo, type ReactNode } from "react";
import { RotateCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
        />
      );
    }

    return this.props.children;
  }
}

const ErrorFallback = ({
  error,
  errorInfo,
}: {
  error: Error | null;
  errorInfo: ErrorInfo | null;
}) => {
  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 p-8 dark:bg-neutral-950">
      <div className="w-full max-w-lg text-center">
        <div className="mb-6 flex justify-center">
          <span
            className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-4xl text-red-600 dark:bg-red-900/30 dark:text-red-400"
            aria-hidden
          >
            !
          </span>
        </div>
        <h1 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          出现了一些问题
        </h1>
        <p className="mb-8 text-neutral-600 dark:text-neutral-400">
          应用程序遇到了意外错误。我们已经记录了这个问题，请尝试刷新页面。
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={handleReload}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <RotateCw className="size-4" />
            刷新页面
          </button>
          <button
            type="button"
            onClick={handleGoHome}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            <Home className="size-4" />
            返回首页
          </button>
        </div>
        {error ? (
          <details className="mt-8 rounded-lg bg-neutral-100 p-4 text-left dark:bg-neutral-800">
            <summary className="mb-2 cursor-pointer font-medium">
              错误详情
            </summary>
            <div className="mt-4">
              <div className="mb-4">
                <strong>错误信息：</strong>
                <pre className="mt-2 overflow-auto rounded bg-white p-2 text-sm dark:bg-neutral-900">
                  {error.toString()}
                </pre>
              </div>
              {errorInfo ? (
                <div>
                  <strong>组件堆栈：</strong>
                  <pre className="mt-2 overflow-auto rounded bg-white p-2 text-sm dark:bg-neutral-900">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              ) : null}
            </div>
          </details>
        ) : null}
      </div>
    </div>
  );
};

// Hook-based wrapper for functional components
export const ErrorBoundary = (props: Props) => {
  return <ErrorBoundaryClass {...props} />;
};

export default ErrorBoundary;
