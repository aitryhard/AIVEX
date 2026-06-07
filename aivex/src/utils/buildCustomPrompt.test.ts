import { describe, it, expect } from "vitest";
import { buildCustomPrompt } from "./buildCustomPrompt";

describe("buildCustomPrompt", () => {
  it("returns custom prompt text if profile has prompt", () => {
    const result = buildCustomPrompt({ name: "Test", prompt: "Be brief" });
    expect(result).toBe("Be brief");
  });

  it("builds prompt with length rule", () => {
    const result = buildCustomPrompt({
      name: "Test",
      prompt: "",
      length: "short",
      thinking: "standard",
    });
    expect(result).toContain("1–3 предложения");
    expect(result).toContain('"Test"');
  });

  it("builds prompt with deep thinking", () => {
    const result = buildCustomPrompt({
      name: "Deep",
      prompt: "",
      length: "detailed",
      thinking: "deep",
    });
    expect(result).toContain("глубоко");
    expect(result).toContain("развёрнуто");
  });

  it("includes style when provided", () => {
    const result = buildCustomPrompt({
      name: "Styled",
      prompt: "",
      length: "standard",
      thinking: "fast",
      style: "дружелюбный",
    });
    expect(result).toContain("дружелюбный");
  });

  it("defaults to professional style", () => {
    const result = buildCustomPrompt({
      name: "Default",
      prompt: "",
      length: "standard",
      thinking: "standard",
    });
    expect(result).toContain("спокойный и профессиональный");
  });

  it("includes markdown instruction", () => {
    const result = buildCustomPrompt({
      name: "X",
      prompt: "",
      length: "standard",
      thinking: "standard",
    });
    expect(result).toContain("markdown");
  });
});
