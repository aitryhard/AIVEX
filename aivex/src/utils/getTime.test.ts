import { describe, it, expect } from "vitest";
import { getTime } from "./getTime";

describe("getTime", () => {
  it("returns a string with HH:MM format", () => {
    const time = getTime();
    expect(time).toMatch(/^\d{2}:\d{2}$/);
  });

  it("returns current time", () => {
    const before = new Date();
    const time = getTime();
    const after = new Date();
    const parts = time.split(":");
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    expect(hours).toBeGreaterThanOrEqual(before.getHours());
    expect(hours).toBeLessThanOrEqual(after.getHours());
    expect(minutes).toBeGreaterThanOrEqual(0);
    expect(minutes).toBeLessThanOrEqual(59);
  });
});
