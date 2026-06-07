import { describe, it, expect } from "vitest";
import { generateFilename } from "./generateFilename";

describe("generateFilename", () => {
  it("returns default for empty input", () => {
    expect(generateFilename("")).toBe("aivex-response");
    expect(generateFilename(undefined)).toBe("aivex-response");
  });

  it("strips markdown code blocks", () => {
    const result = generateFilename("Hello ```js\ncode\n``` world");
    expect(result).not.toContain("```");
    expect(result).toContain("Hello");
  });

  it("strips markdown headings", () => {
    const result = generateFilename("## Title here");
    expect(result).toBe("Title here");
  });

  it("strips markdown formatting chars", () => {
    const result = generateFilename("**Important** _note_ `code`");
    expect(result).toBe("Important note code");
  });

  it("strips markdown links", () => {
    const result = generateFilename("[Click here](https://example.com)");
    expect(result).toBe("Click here");
  });

  it("truncates to 60 characters", () => {
    const long = "A".repeat(100);
    const result = generateFilename(long);
    expect(result.length).toBeLessThanOrEqual(60);
  });

  it("takes first meaningful line", () => {
    const result = generateFilename("ab\n\nThis is a longer meaningful line here yes");
    expect(result).toContain("This is a longer meaningful line");
  });
});
