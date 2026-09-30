// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { handleDeviceCode, handleDeviceToken } from "./deviceFlow.js";

const env = { VITE_GITHUB_CLIENT_ID: "client-id", VITE_GITHUB_OAUTH_SCOPE: "read:user" };
const post = (body: unknown = {}) =>
  new Request("http://localhost/api", { method: "POST", body: JSON.stringify(body) });
const github = (body: unknown) => {
  const fetchMock = vi.fn().mockResolvedValue(Response.json(body));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

afterEach(() => vi.unstubAllGlobals());

describe("handleDeviceCode", () => {
  it("requests a user code with the configured client ID and scope", async () => {
    const fetchMock = github({
      device_code: "dev123",
      user_code: "WDJB-MJHT",
      verification_uri: "https://github.com/login/device",
      expires_in: 900,
      interval: 5,
    });

    const res = await handleDeviceCode(post(), env);

    expect(await res.json()).toEqual({
      device_code: "dev123",
      user_code: "WDJB-MJHT",
      verification_uri: "https://github.com/login/device",
      expires_in: 900,
      interval: 5,
    });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://github.com/login/device/code");
    expect(JSON.parse(init.body)).toEqual({ client_id: "client-id", scope: "read:user" });
  });

  it("explains how to fix a disabled Device Flow", async () => {
    github({ error: "device_flow_disabled" });

    const res = await handleDeviceCode(post(), env);

    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toMatch(/enable it in the app's settings/i);
  });

  it("points at the client ID when GitHub doesn't know the app", async () => {
    github({ error: "Not Found" });
    const res = await handleDeviceCode(post(), env);
    expect(((await res.json()) as { error: string }).error).toMatch(/VITE_GITHUB_CLIENT_ID/);
  });

  it("fails clearly when not configured", async () => {
    expect((await handleDeviceCode(post(), {})).status).toBe(500);
  });

  it("only accepts POST", async () => {
    expect((await handleDeviceCode(new Request("http://localhost"), env)).status).toBe(405);
  });
});

describe("handleDeviceToken", () => {
  it("requires a device code", async () => {
    expect((await handleDeviceToken(post({}), env)).status).toBe(400);
  });

  it("returns the token once approved, using the device-code grant", async () => {
    const fetchMock = github({ access_token: "gho_abc", token_type: "bearer" });

    const res = await handleDeviceToken(post({ device_code: "dev123" }), env);

    expect(await res.json()).toEqual({ status: "complete", access_token: "gho_abc" });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      client_id: "client-id",
      device_code: "dev123",
      grant_type: "urn:ietf:params:oauth:grant-type:device_code",
    });
  });

  it.each([
    [{ error: "authorization_pending" }, { status: "pending" }],
    [{ error: "slow_down", interval: 10 }, { status: "slow_down", interval: 10 }],
    [{ error: "expired_token" }, { status: "expired" }],
    [{ error: "access_denied" }, { status: "denied" }],
  ])("maps %j", async (upstream, expected) => {
    github(upstream);
    const res = await handleDeviceToken(post({ device_code: "dev123" }), env);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(expected);
  });

  it("reports unexpected errors", async () => {
    github({ error: "incorrect_client_credentials", error_description: "Bad client." });
    const res = await handleDeviceToken(post({ device_code: "dev123" }), env);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Bad client." });
  });
});
