"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";

export default function QuestionPane({ problemId, description, loading }: { problemId?: string | null; description?: string | null; loading?: boolean }) {
  const { resolvedTheme } = useTheme();
  const themeStyle = resolvedTheme === "light" ? oneLight : oneDark;

  return (
    <div className="h-full rounded-xl border bg-card p-4 overflow-y-auto">
      <div className="mt-4 h-full prose prose-sm dark:prose-invert max-w-none">
        {!problemId ? (
          <div className="text-sm text-muted-foreground">No problem selected.</div>
        ) : loading ? (
          <div className="text-sm italic">Loading problem <span className="font-mono text-primary">{problemId}</span>...</div>
        ) : description ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              // This styles the code blocks (like Input/Output)
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline ? (
                  <SyntaxHighlighter
                    style={themeStyle}
                    language={match ? match[1] : "text"}
                    PreTag="pre"
                    customStyle={{ margin: "1em 0", borderRadius: "8px", fontSize: "13px" }}
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className="bg-muted px-1.5 py-0.5 rounded text-secondary-foreground font-mono text-xs" {...props}>
                    {children}
                  </code>
                );
              },
              // Optional: Customize header styles to be tighter
              h1: ({children}) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
              h2: ({children}) => <h2 className="text-lg font-semibold mt-6 mb-2 border-b pb-1">{children}</h2>,
              p: ({children}) => <div className="mb-4">{children}</div>,
            }}
          >
            {description}
          </ReactMarkdown>
        ) : (
          <div className="text-sm text-muted-foreground">Problem not found.</div>
        )}
      </div>
    </div>
  );
}