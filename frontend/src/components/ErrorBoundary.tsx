import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ErrorBoundary.css';

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
        console.error('ErrorBoundary caught an error:', error, errorInfo);
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

            return <ErrorFallback error={this.state.error} errorInfo={this.state.errorInfo} />;
        }

        return this.props.children;
    }
}

const ErrorFallback: React.FC<{ error: Error | null; errorInfo: ErrorInfo | null }> = ({ error, errorInfo }) => {
    const navigate = useNavigate();

    const handleReload = () => {
        window.location.reload();
    };

    const handleGoHome = () => {
        navigate('/');
        window.location.reload();
    };

    return (
        <div className="error-boundary">
            <div className="error-boundary-content">
                <div className="error-boundary-icon">
                    <AlertTriangle size={64} strokeWidth={1.5} />
                </div>
                <h1 className="error-boundary-title">出现了一些问题</h1>
                <p className="error-boundary-message">
                    应用程序遇到了意外错误。我们已经记录了这个问题，请尝试刷新页面。
                </p>
                {error && (
                    <details className="error-boundary-details">
                        <summary className="error-boundary-summary">错误详情</summary>
                        <div className="error-boundary-error">
                            <strong>错误信息：</strong>
                            <pre>{error.toString()}</pre>
                            {errorInfo && (
                                <>
                                    <strong>组件堆栈：</strong>
                                    <pre>{errorInfo.componentStack}</pre>
                                </>
                            )}
                        </div>
                    </details>
                )}
                <div className="error-boundary-actions">
                    <button onClick={handleReload} className="btn btn-primary">
                        <RefreshCw size={18} />
                        刷新页面
                    </button>
                    <button onClick={handleGoHome} className="btn btn-secondary">
                        <Home size={18} />
                        返回首页
                    </button>
                </div>
            </div>
        </div>
    );
};

// Hook-based wrapper for functional components
export const ErrorBoundary: React.FC<Props> = (props) => {
    return <ErrorBoundaryClass {...props} />;
};

export default ErrorBoundary;