import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { normalizeNewlines } from "@/shared/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer = ({
  content,
  className = "",
}: MarkdownRendererProps) => {
  const raw = typeof content === "string" ? content : "";
  const safeContent = normalizeNewlines(raw);
  return (
    <div className={`markdown-content ${className}`.trim()}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{safeContent}</ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
