import React from 'react'
import { Result, Button } from 'antd'
import { css } from '@emotion/react'

interface Props {
    children: React.ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

const errorStyles = {
    container: css`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: 24px;
  `
}

class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div css={errorStyles.container}>
                    <Result
                        status="500"
                        title="页面加载失败"
                        subTitle="抱歉，出现了一些问题，请尝试刷新页面。"
                        extra={
                            <Button type="primary" onClick={() => window.location.reload()}>
                                刷新页面
                            </Button>
                        }
                    />
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary