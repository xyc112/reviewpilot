import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>;
};

export default MarkdownRenderer;
