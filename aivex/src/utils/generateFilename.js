export function generateFilename(text) {
  const cleaned = text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/#{1,6}\s*/g, "")
    .replace(/[*_`~]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  const firstLine = cleaned.split("\n").find((l) => l.trim().length > 10) || cleaned;
  const title = firstLine.trim().slice(0, 60).trim();

  return title || "aivex-response";
}
