import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import { formatLanguageName } from "./formatLanguageName";

export function renderMarkdown(text, copyCode, copiedCode, uiSettings) {
  return (
    <ReactMarkdown
      components={{
        pre({ children }) {
          return <>{children}</>;
        },

        code({ inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");

          if (!inline && match) {
            const codeText = String(children).replace(/\n$/, "");

            return (
              <div
                className="my-4 overflow-hidden rounded-2xl border border-white/10 shadow-[0_12px_35px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
                style={{
                  background: `${uiSettings.panelColor}88`,
                  borderColor: `${uiSettings.userColor}18`,
                }}
              >
                <div className="flex items-center justify-between px-4 pt-3 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="relative w-2.5 h-2.5 opacity-70 shrink-0 mt-[1px]">
                      <div className="absolute inset-0 border border-white rotate-45 rounded-[1px]" />
                      <div className="absolute inset-[2px] bg-white rotate-45 rounded-[1px]" />
                    </div>

                    <span className="text-[13px] text-white/90 font-semibold tracking-[0.02em] ml-1">
                      {formatLanguageName(match[1])}
                    </span>
                  </div>

                  <button
                    onClick={() => copyCode(codeText)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white/35 hover:text-white/80 hover:bg-white/10 transition"
                    title={
                      copiedCode === codeText
                        ? "Скопировано"
                        : "Копировать"
                    }
                  >
                    {copiedCode === codeText ? (
                      <Check size={14} />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>

                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    padding: "14px 16px 16px",
                    background: "rgba(0,0,0,0.12)",
                    fontSize: "12px",
                    borderRadius: 0,
                  }}
                  codeTagProps={{
                    style: {
                      background: "rgba(0,0,0,0.12)",
                    },
                  }}
                  {...props}
                >
                  {codeText}
                </SyntaxHighlighter>
              </div>
            );
          }

          return (
            <code className="px-1.5 py-0.5 rounded-md bg-white/10 text-white/90">
              {children}
            </code>
          );
        },
      }}
    >
      {text}
    </ReactMarkdown>
  );
}