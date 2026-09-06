import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-wm">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={{
          img: ({ node: _node, alt, ...props }) => (
            <img {...props} alt={alt ?? ""} loading="lazy" decoding="async" className="mx-auto rounded-xl border border-ink-700" />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
