import { pollDeviceToken, requestDeviceCode, signInWithToken } from "@/libs/auth";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDeviceFlow } from "./useDeviceFlow";

vi.mock("@/libs/auth", () => ({
  requestDeviceCode: vi.fn(),
  pollDeviceToken: vi.fn(),
  signInWithToken: vi.fn(),
}));

const code = {
  device_code: "dev123",
  user_code: "WDJB-MJHT",
  verification_uri: "https://github.com/login/device",
  expires_in: 900,
  interval: 5,
};

/** Advance fake time and let the awaited promises settle. */
const tick = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms));

beforeEach(() => {
  vi.useFakeTimers();
  vi.mocked(requestDeviceCode).mockResolvedValue(code);
});
afterEach(() => vi.useRealTimers());

describe("useDeviceFlow", () => {
  it("shows the user code, polls at the given interval and signs in once approved", async () => {
    vi.mocked(pollDeviceToken)
      .mockResolvedValueOnce({ status: "pending" })
      .mockResolvedValueOnce({ status: "complete", access_token: "gho_abc" });

    const { result } = renderHook(() => useDeviceFlow());
    expect(result.current.status).toBe("requesting");

    await tick(0);
    expect(result.current).toMatchObject({ status: "waiting", code: { user_code: "WDJB-MJHT" } });
    expect(pollDeviceToken).not.toHaveBeenCalled();

    await tick(5000);
    expect(pollDeviceToken).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe("waiting");

    await tick(5000);
    expect(signInWithToken).toHaveBeenCalledWith("gho_abc");
    expect(result.current.status).toBe("success");
  });

  it("backs off when GitHub says slow_down", async () => {
    vi.mocked(pollDeviceToken)
      .mockResolvedValueOnce({ status: "slow_down", interval: 10 })
      .mockResolvedValue({ status: "pending" });

    renderHook(() => useDeviceFlow());
    await tick(0);
    await tick(5000);
    expect(pollDeviceToken).toHaveBeenCalledTimes(1);

    await tick(5000); // old interval — must not poll yet
    expect(pollDeviceToken).toHaveBeenCalledTimes(1);
    await tick(5000);
    expect(pollDeviceToken).toHaveBeenCalledTimes(2);
  });

  it.each([
    ["denied", /denied/],
    ["expired", /expired/],
  ] as const)("reports %s", async (status, message) => {
    vi.mocked(pollDeviceToken).mockResolvedValue({ status });

    const { result } = renderHook(() => useDeviceFlow());
    await tick(0);
    await tick(5000);

    expect(result.current.status).toBe("error");
    expect(result.current).toMatchObject({ message: expect.stringMatching(message) });
  });

  it("reports a failure to start", async () => {
    vi.mocked(requestDeviceCode).mockRejectedValue(new Error("Device Flow is disabled"));

    const { result } = renderHook(() => useDeviceFlow());
    await tick(0);

    expect(result.current).toEqual({ status: "error", message: "Device Flow is disabled" });
  });

  it("ignores a response that arrives after unmount", async () => {
    let resolvePoll!: (v: { status: "complete"; access_token: string }) => void;
    vi.mocked(pollDeviceToken).mockReturnValue(new Promise((r) => (resolvePoll = r)));

    const { unmount } = renderHook(() => useDeviceFlow());
    await tick(0);
    await tick(5000);
    unmount();
    resolvePoll({ status: "complete", access_token: "late" });
    await tick(0);

    expect(signInWithToken).not.toHaveBeenCalled();
  });

  it("stops polling when unmounted", async () => {
    vi.mocked(pollDeviceToken).mockResolvedValue({ status: "pending" });

    const { unmount } = renderHook(() => useDeviceFlow());
    await tick(0);
    unmount();
    await tick(60_000);

    expect(pollDeviceToken).not.toHaveBeenCalled();
  });
});
