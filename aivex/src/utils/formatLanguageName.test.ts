import { describe, it, expect } from "vitest";
import { formatLanguageName } from "./formatLanguageName";

describe("formatLanguageName", () => {
  it("returns full name for short names", () => {
    expect(formatLanguageName("js")).toBe("JavaScript");
    expect(formatLanguageName("ts")).toBe("TypeScript");
    expect(formatLanguageName("py")).toBe("Python");
    expect(formatLanguageName("html")).toBe("HTML");
    expect(formatLanguageName("css")).toBe("CSS");
    expect(formatLanguageName("json")).toBe("JSON");
  });

  it("returns full name for long names", () => {
    expect(formatLanguageName("javascript")).toBe("JavaScript");
    expect(formatLanguageName("typescript")).toBe("TypeScript");
    expect(formatLanguageName("python")).toBe("Python");
  });

  it("handles case insensitive input", () => {
    expect(formatLanguageName("JS")).toBe("JavaScript");
    expect(formatLanguageName("Ts")).toBe("TypeScript");
    expect(formatLanguageName("PYTHON")).toBe("Python");
  });

  it("returns original for unknown languages", () => {
    expect(formatLanguageName("rust")).toBe("rust");
    expect(formatLanguageName("go")).toBe("go");
  });

  it("handles undefined safely", () => {
    expect(formatLanguageName(undefined)).toBe("");
  });
});
