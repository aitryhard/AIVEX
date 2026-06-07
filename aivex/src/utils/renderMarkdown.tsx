import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import { formatLanguageName } from "./formatLanguageName";
import type { UiSettings } from "../types";
import type { Components } from "react-markdown";

export function renderMarkdown(
  text: string,
  copyCode: (code: string) => void,
  copiedCode: string,
  uiSettings: UiSettings,
) {
  return (
    <ReactMarkdown
      components={{
        h1({ children }: { children: React.ReactNode }) {
          return <h1 className="text-base font-bold mt-5 mb-3 text-white/95 leading-snug">{children}</h1>;
        },

        h2({ children }: { children: React.ReactNode }) {
          return <h2 className="text-[15px] font-bold mt-4 mb-2.5 text-white/95 leading-snug">{children}</h2>;
        },

        h3({ children }: { children: React.ReactNode }) {
          return <h3 className="text-sm font-semibold mt-4 mb-2 text-white/90 leading-snug">{children}</h3>;
        },

        ul({ children }: { children: React.ReactNode }) {
          return <ul className="my-2 pl-5 space-y-1.5 list-disc [&_li]:pl-1">{children}</ul>;
        },

        ol({ children }: { children: React.ReactNode }) {
          return <ol className="my-2 pl-5 space-y-1.5 list-decimal [&_li]:pl-1">{children}</ol>;
        },

        li({ children }: { children: React.ReactNode }) {
          return <li className="leading-[20px] text-white/85 [&>p]:!my-0">{children}</li>;
        },

        blockquote({ children }: { children: React.ReactNode }) {
          return (
            <div className="my-3 pl-3 py-1.5 border-l-2 border-[#8B4DFF]/50 rounded-sm bg-white/[0.03] text-white/70 text-sm italic leading-[20px]">
              {children}
            </div>
          );
        },

        hr() {
          return <hr className="my-4 border-white/8" />;
        },

        strong({ children }: { children: React.ReactNode }) {
          return <strong className="font-semibold text-white/95">{children}</strong>;
        },

        em({ children }: { children: React.ReactNode }) {
          return <em className="italic text-white/80">{children}</em>;
        },

        pre({ children }: { children: React.ReactNode }) {
          return <>{children}</>;
        },

        code({ inline, className, children, ...props }: {
          inline?: boolean;
          className?: string;
          children: React.ReactNode;
        }) {
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
                >
                  {codeText}
                </SyntaxHighlighter>
              </div>
            );
          }

          return (
            <code className="px-1.5 py-0.5 rounded-md bg-white/10 text-white/90 text-[12.5px]">
              {children}
            </code>
          );
        },
      } as Partial<Components>}
    >
      {text}
    </ReactMarkdown>
  );
}
