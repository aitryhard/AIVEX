import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("./config", () => ({ API_URL: "http://127.0.0.1:8000" }));
vi.mock("./endpoints", () => ({ ENDPOINTS: { CHAT: "/chat" } }));

const module = await import("./chatapi");

const signal = new AbortController().signal;

describe("getDeviceId", () => {
  it("returns empty string without aivexWindow", async () => {
    vi.stubGlobal("window", {});
    const id = await module.getDeviceId();
    expect(id).toBe("");
    vi.unstubAllGlobals();
  });
});

describe("sendChatRequest", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      aivexWindow: { getDeviceId: vi.fn().mockResolvedValue("dev-001") },
    });
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ response: "Hello" }),
    }) as unknown as typeof globalThis.fetch;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends correct payload with device_id and model", async () => {
    await module.sendChatRequest({
      text: "Hi",
      profile: "Tutor",
      images: [],
      customPrompt: null,
      history: [],
      signal,
      currentTier: "free",
    });

    const body = JSON.parse((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
    expect(body.text).toBe("Hi");
    expect(body.device_id).toBe("dev-001");
    expect(body.model).toBe("openai/gpt-4o-mini");
  });

  it("uses gpt-4o for pro tier", async () => {
    await module.sendChatRequest({
      text: "Q",
      profile: "Tutor",
      images: [],
      customPrompt: "cp",
      history: [],
      signal,
      currentTier: "pro",
    });

    const body = JSON.parse((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
    expect(body.model).toBe("openai/gpt-4o");
  });

  it("throws on non-ok HTTP status", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      text: () => Promise.resolve("Server crash"),
    });

    await expect(
      module.sendChatRequest({
        text: "X",
        profile: "Tutor",
        images: [],
        customPrompt: null,
        history: [],
        signal,
        currentTier: "free",
      }),
    ).rejects.toThrow("Server crash");
  });

  it("maps device_id_required error to Russian message", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ error: "device_id_required" }),
    });

    await expect(
      module.sendChatRequest({
        text: "Y",
        profile: "Tutor",
        images: [],
        customPrompt: null,
        history: [],
        signal,
        currentTier: "free",
      }),
    ).rejects.toThrow("Устройство не идентифицировано.");
  });
});
