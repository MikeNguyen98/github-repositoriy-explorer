import { pollDeviceToken, requestDeviceCode, signInWithToken, type DeviceCode } from "@/libs/auth";
import { useEffect, useReducer } from "react";

export type DeviceFlowState =
  | { status: "requesting" }
  | { status: "waiting"; code: DeviceCode; expiresAt: number }
  | { status: "success" }
  | { status: "error"; message: string };

type Action =
  | { type: "code"; code: DeviceCode }
  | { type: "success" }
  | { type: "error"; message: string };

function reducer(_: DeviceFlowState, action: Action): DeviceFlowState {
  switch (action.type) {
    case "code":
      return {
        status: "waiting",
        code: action.code,
        expiresAt: Date.now() + action.code.expires_in * 1000,
      };
    case "success":
      return { status: "success" };
    case "error":
      return { status: "error", message: action.message };
  }
}

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason);
    const t = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(t);
        reject(signal.reason);
      },
      { once: true },
    );
  });

/**
 * Runs GitHub's Device Flow for as long as the calling component is mounted:
 * requests a user code, then polls until the user approves it on github.com.
 * Remount (e.g. change `key`) to start over.
 */
export function useDeviceFlow() {
  const [state, dispatch] = useReducer(reducer, { status: "requesting" });

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      const code = await requestDeviceCode(signal);
      signal.throwIfAborted();
      dispatch({ type: "code", code });

      const deadline = Date.now() + code.expires_in * 1000;
      let interval = code.interval;

      while (Date.now() < deadline) {
        await sleep(interval * 1000, signal);
        const result = await pollDeviceToken(code.device_code, signal);
        // Never act on a flow that was cancelled while the request was in flight.
        signal.throwIfAborted();

        switch (result.status) {
          case "complete":
            signInWithToken(result.access_token);
            dispatch({ type: "success" });
            return;
          case "slow_down":
            // GitHub asks us to back off; use the interval it returns.
            interval = result.interval;
            break;
          case "denied":
            throw new Error("Access was denied on GitHub.");
          case "expired":
            throw new Error("The code expired. Start again to get a new one.");
        }
      }
      throw new Error("The code expired. Start again to get a new one.");
    })().catch((error: Error) => {
      if (!signal.aborted) dispatch({ type: "error", message: error.message });
    });

    return () => controller.abort();
  }, []);

  return state;
}
