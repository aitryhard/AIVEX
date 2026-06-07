import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("../services/chatapi", () => ({
  sendChatRequest: vi.fn(),
}));

const { sendChatRequest } = await import("../services/chatapi");
const { useChatActions } = await import("./useChatActions");

function defaults(overrides: Record<string, unknown> = {}) {
  return {
    isLoading: false,
    isTyping: false,
    setIsLoading: vi.fn(),
    setIsTyping: vi.fn(),
    messages: [],
    setMessages: vi.fn(),
    messageInputRef: { current: { value: "" } } as unknown as React.RefObject<HTMLTextAreaElement | null>,
    clipboardImages: [],
    setClipboardImages: vi.fn(),
    customProfiles: [],
    profile: "Tutor",
    currentTier: "pro",
    ...overrides,
  };
}

describe("useChatActions", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(sendChatRequest).mockClear();
    vi.mocked(sendChatRequest).mockResolvedValue({ response: "OK" });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("exposes expected functions", () => {
    const { result } = renderHook(() => useChatActions(defaults()));
    expect(result.current.sendMessage).toBeTypeOf("function");
    expect(result.current.cancelRequest).toBeTypeOf("function");
    expect(result.current.copyText).toBeTypeOf("function");
  });

  it("blocks send when isTyping is true", async () => {
    const setMessages = vi.fn();
    const { result } = renderHook(() =>
      useChatActions(defaults({ isTyping: true, setMessages })),
    );
    await act(async () => {
      result.current.sendMessage();
    });
    expect(setMessages).not.toHaveBeenCalled();
  });

  it("adds limit message when free tier count is 50", async () => {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem("aivex_daily_count", JSON.stringify({ date: today, count: 50 }));

    const setMessages = vi.fn();
    const { result } = renderHook(() =>
      useChatActions(
        defaults({
          currentTier: "free",
          setMessages,
          messageInputRef: { current: { value: "hello" } } as unknown as React.RefObject<HTMLTextAreaElement | null>,
        }),
      ),
    );

    await act(async () => {
      result.current.sendMessage();
    });

    expect(setMessages).toHaveBeenCalled();
    const added = setMessages.mock.calls[0][0]([]);
    expect(added[0].text).toMatch(/лимит/);
  });

  it("does not call sendChatRequest when input is empty and no images", async () => {
    const { result } = renderHook(() => useChatActions(defaults()));

    await act(async () => {
      result.current.sendMessage();
    });

    expect(sendChatRequest).not.toHaveBeenCalled();
  });

  it("calls sendChatRequest with text message", async () => {
    const { result } = renderHook(() =>
      useChatActions(
        defaults({ messageInputRef: { current: { value: "test message" } } as unknown as React.RefObject<HTMLTextAreaElement | null> }),
      ),
    );

    await act(async () => {
      result.current.sendMessage();
    });

    vi.advanceTimersByTime(500);

    await act(async () => {});
    expect(sendChatRequest).toHaveBeenCalled();
  });
});
