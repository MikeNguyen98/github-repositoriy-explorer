/**
 * GitHub OAuth Device Flow, relayed server-side because github.com's
 * /login/device/code and /login/oauth/access_token endpoints don't allow CORS.
 *
 * Device Flow needs only the public client ID — no client secret and no
 * callback URL — so the same OAuth App works on localhost and any domain.
 * https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#device-flow
 */
type Env = Record<string, string | undefined>;

export type DevicePollResult =
  | { status: "complete"; access_token: string }
  | { status: "pending" }
  | { status: "slow_down"; interval: number }
  | { status: "expired" }
  | { status: "denied" };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

async function postToGitHub(url: string, body: Record<string, string>) {
  const res = await fetch(url, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json().catch(() => ({}))) as Record<string, unknown>;
}

function config(request: Request, env: Env) {
  if (request.method !== "POST") return { error: json({ error: "Method not allowed." }, 405) };
  const clientId = env.VITE_GITHUB_CLIENT_ID;
  if (!clientId) {
    return { error: json({ error: "GitHub sign-in is not configured on the server." }, 500) };
  }
  return { clientId, scope: env.VITE_GITHUB_OAUTH_SCOPE ?? "read:user repo" };
}

/** POST /api/auth/device/code → { device_code, user_code, verification_uri, expires_in, interval } */
export async function handleDeviceCode(request: Request, env: Env) {
  const { clientId, scope, error } = config(request, env);
  if (error) return error;

  const data = await postToGitHub("https://github.com/login/device/code", {
    client_id: clientId,
    scope,
  });

  if (typeof data.device_code !== "string") {
    const message =
      data.error === "device_flow_disabled"
        ? "Device Flow is disabled for this OAuth App. Enable it in the app's settings on GitHub."
        : data.error === "Not Found"
          ? "GitHub doesn't recognise this OAuth App. Check VITE_GITHUB_CLIENT_ID."
          : ((data.error_description as string | undefined) ?? "Could not start GitHub sign-in.");
    return json({ error: message }, 400);
  }

  const { device_code, user_code, verification_uri, expires_in, interval } = data;
  return json({ device_code, user_code, verification_uri, expires_in, interval });
}

/** POST /api/auth/device/token { device_code } → DevicePollResult */
export async function handleDeviceToken(request: Request, env: Env) {
  const { clientId, error } = config(request, env);
  if (error) return error;

  let deviceCode: unknown;
  try {
    ({ device_code: deviceCode } = (await request.json()) as { device_code?: unknown });
  } catch {
    // fall through to the validation below
  }
  if (typeof deviceCode !== "string" || !deviceCode) {
    return json({ error: "Missing device code." }, 400);
  }

  const data = await postToGitHub("https://github.com/login/oauth/access_token", {
    client_id: clientId,
    device_code: deviceCode,
    grant_type: "urn:ietf:params:oauth:grant-type:device_code",
  });

  let result: DevicePollResult | undefined;
  if (typeof data.access_token === "string") {
    result = { status: "complete", access_token: data.access_token };
  } else if (data.error === "authorization_pending") {
    result = { status: "pending" };
  } else if (data.error === "slow_down") {
    result = { status: "slow_down", interval: Number(data.interval) || 10 };
  } else if (data.error === "expired_token") {
    result = { status: "expired" };
  } else if (data.error === "access_denied") {
    result = { status: "denied" };
  }

  return result
    ? json(result)
    : json({ error: (data.error_description as string | undefined) ?? "Sign-in failed." }, 400);
}
