const LANGUAGE_NAMES: Record<string, string> = {
  js: "JavaScript",
  javascript: "JavaScript",
  jsx: "JSX",
  ts: "TypeScript",
  typescript: "TypeScript",
  tsx: "TSX",
  py: "Python",
  python: "Python",
  html: "HTML",
  css: "CSS",
  json: "JSON",
  bash: "Bash",
  shell: "Shell",
};

export function formatLanguageName(language?: string): string {
  return LANGUAGE_NAMES[language?.toLowerCase() ?? ""] || language || "";
}
