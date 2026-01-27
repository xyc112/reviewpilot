import React, { Component, ErrorInfo, ReactNode } from "react";
import { Result, Button, Space } from "antd";
import { ReloadOutlined, HomeOutlined } from "@ant-design/icons";

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

const ErrorFallback: React.FC<{
  error: Error | null;
  errorInfo: ErrorInfo | null;
}> = ({ error, errorInfo }) => {
  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <Result
        status="error"
        title="出现了一些问题"
        subTitle="应用程序遇到了意外错误。我们已经记录了这个问题，请尝试刷新页面。"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={handleReload}
            >
              刷新页面
            </Button>
            <Button
              icon={<HomeOutlined />}
              onClick={handleGoHome}
            >
              返回首页
            </Button>
          </Space>
        }
      >
        {error && (
          <details
            style={{
              marginTop: "2rem",
              padding: "1rem",
              background: "#fafafa",
              borderRadius: "4px",
              textAlign: "left",
            }}
          >
            <summary style={{ cursor: "pointer", fontWeight: 500, marginBottom: "0.5rem" }}>
              错误详情
            </summary>
            <div style={{ marginTop: "1rem" }}>
              <div style={{ marginBottom: "1rem" }}>
                <strong>错误信息：</strong>
                <pre style={{ background: "#fff", padding: "0.5rem", borderRadius: "4px", overflow: "auto" }}>
                  {error.toString()}
                </pre>
              </div>
              {errorInfo && (
                <div>
                  <strong>组件堆栈：</strong>
                  <pre style={{ background: "#fff", padding: "0.5rem", borderRadius: "4px", overflow: "auto" }}>
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}
      </Result>
    </div>
  );
};

// Hook-based wrapper for functional components
export const ErrorBoundary: React.FC<Props> = (props) => {
  return <ErrorBoundaryClass {...props} />;
};

export default ErrorBoundary;
