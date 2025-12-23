import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './MarkdownRenderer.css';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
    // 将 \n 转换为实际的换行符，以便 Markdown 正确渲染
    const processedContent = content.replace(/\\n/g, '\n');
    
    return (
        <div className={`markdown-content ${className}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {processedContent}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;

