import { Component, type ErrorInfo, type ReactNode } from "react";
import { RotateCw, Home, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      <div className="w-full max-w-lg text-center">
        <div className="mb-6 flex justify-center">
          <div
            className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive"
            aria-hidden
          >
            <AlertCircle className="size-8" />
          </div>
        </div>
        <h1 className="mb-2 text-xl font-semibold text-foreground">
          出现了一些问题
        </h1>
        <p className="mb-8 text-muted-foreground">
          应用程序遇到了意外错误。我们已经记录了这个问题，请尝试刷新页面。
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={handleReload}>
            <RotateCw className="size-4" />
            刷新页面
          </Button>
          <Button variant="outline" onClick={handleGoHome}>
            <Home className="size-4" />
            返回首页
          </Button>
        </div>
        {error ? (
          <details className="mt-8 rounded-lg bg-muted p-4 text-left">
            <summary className="mb-2 cursor-pointer font-medium text-foreground">
              错误详情
            </summary>
            <div className="mt-4">
              <div className="mb-4">
                <strong className="text-foreground">错误信息：</strong>
                <pre className="mt-2 overflow-auto rounded bg-card p-2 text-sm text-foreground">
                  {error.toString()}
                </pre>
              </div>
              {errorInfo ? (
                <div>
                  <strong className="text-foreground">组件堆栈：</strong>
                  <pre className="mt-2 overflow-auto rounded bg-card p-2 text-sm text-foreground">
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

export const ErrorBoundary = (props: Props) => {
  return <ErrorBoundaryClass {...props} />;
};

export default ErrorBoundary;
