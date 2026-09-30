import type { DevicePollResult } from "../../api/_lib/deviceFlow";
import { queryClient } from "./queryClient";

const TOKEN_KEY = "gh-token";
const listeners = new Set<() => void>();

function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

let token = readToken();

function setToken(next: string | null) {
  token = next;
  try {
    if (next) localStorage.setItem(TOKEN_KEY, next);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // storage unavailable — the session still works until reload
  }
  // Cached responses depend on who is asking (private repos, rate limits).
  queryClient.clear();
  listeners.forEach((l) => l());
}

export const authStore = {
  getToken: () => token,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export const isAuthConfigured = Boolean(import.meta.env.VITE_GITHUB_CLIENT_ID);

export interface DeviceCode {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

export type { DevicePollResult };

async function post<T>(url: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? "Could not reach the sign-in service.");
  return data;
}

/** Step 1 of Device Flow: get a user code for github.com/login/device. */
export const requestDeviceCode = (signal?: AbortSignal) =>
  post<DeviceCode>("/api/auth/device/code", {}, signal);

/** Step 2: ask whether the user has approved the code yet. */
export const pollDeviceToken = (deviceCode: string, signal?: AbortSignal) =>
  post<DevicePollResult>("/api/auth/device/token", { device_code: deviceCode }, signal);

export const signInWithToken = (accessToken: string) => setToken(accessToken);
export const signOut = () => setToken(null);
