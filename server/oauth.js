import { createHash, randomBytes } from "node:crypto";
import { importPKCS8, jwtVerify, SignJWT, createRemoteJWKSet } from "jose";
import { config } from "./config.js";
import { db } from "./db.js";
import { AppError } from "./http.js";

const appleJwks = createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));

const providerDefinitions = {
  google: {
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scope: "openid email profile",
  },
  github: {
    authorizeUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    scope: "read:user user:email",
  },
  apple: {
    authorizeUrl: "https://appleid.apple.com/auth/authorize",
    tokenUrl: "https://appleid.apple.com/auth/token",
    scope: "name email",
    responseMode: "form_post",
  },
  x: {
    authorizeUrl: "https://x.com/i/oauth2/authorize",
    tokenUrl: "https://api.x.com/2/oauth2/token",
    scope: "tweet.read users.read offline.access",
  },
};

export const providerLabels = {
  google: "Google",
  github: "GitHub",
  apple: "Apple",
  x: "X",
};

export function isProviderConfigured(provider) {
  const values = config.oauth[provider];
  if (!values) return false;
  if (provider === "apple") {
    return Boolean(values.clientId && values.teamId && values.keyId && values.privateKey);
  }
  return Boolean(values.clientId && values.clientSecret);
}

export function getProviderStatus() {
  return Object.fromEntries(
    Object.keys(providerDefinitions).map((provider) => [
      provider,
      { configured: isProviderConfigured(provider), label: providerLabels[provider] },
    ]),
  );
}

function callbackUrl(provider) {
  return `${config.apiOrigin}/api/auth/oauth/${provider}/callback`;
}

function requireProvider(provider) {
  if (!providerDefinitions[provider]) {
    throw new AppError(404, "UNKNOWN_PROVIDER", "Unknown OAuth provider");
  }
  if (!isProviderConfigured(provider)) {
    throw new AppError(
      503,
      "PROVIDER_NOT_CONFIGURED",
      `${providerLabels[provider]} sign-in is not configured`,
    );
  }
  return config.oauth[provider];
}

function pkceChallenge(verifier) {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function beginOAuth(provider, redirectTo = "/dashboard") {
  const values = requireProvider(provider);
  const definition = providerDefinitions[provider];
  const state = randomBytes(24).toString("base64url");
  const verifier = randomBytes(48).toString("base64url");
  const safeRedirect = String(redirectTo || "/dashboard").startsWith("/")
    ? String(redirectTo).slice(0, 200)
    : "/dashboard";

  db.prepare(`
    INSERT INTO oauth_states (state, provider, verifier, redirect_to, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(state, provider, verifier, safeRedirect, Date.now() + 10 * 60 * 1000);

  const url = new URL(definition.authorizeUrl);
  url.searchParams.set("client_id", values.clientId);
  url.searchParams.set("redirect_uri", callbackUrl(provider));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", definition.scope);
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", pkceChallenge(verifier));
  url.searchParams.set("code_challenge_method", "S256");

  if (provider === "google") {
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "select_account");
  }
  if (provider === "apple") {
    url.searchParams.set("response_mode", definition.responseMode);
  }
  if (provider === "github") {
    url.searchParams.set("allow_signup", "true");
  }

  return url.toString();
}

function consumeOAuthState(state, provider) {
  if (!state) {
    throw new AppError(400, "OAUTH_STATE_MISSING", "OAuth state is missing");
  }
  const row = db.prepare(
    "SELECT * FROM oauth_states WHERE state = ? AND provider = ?",
  ).get(state, provider);
  if (!row) {
    throw new AppError(400, "OAUTH_STATE_INVALID", "OAuth state is invalid");
  }
  db.prepare("DELETE FROM oauth_states WHERE state = ?").run(state);
  if (row.expires_at < Date.now()) {
    throw new AppError(400, "OAUTH_STATE_EXPIRED", "OAuth request has expired");
  }
  return row;
}

async function fetchJson(url, options) {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(15_000),
    headers: {
      Accept: "application/json",
      "User-Agent": "DyToken/1.0",
      ...options?.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new AppError(
      502,
      "OAUTH_PROVIDER_ERROR",
      data.error_description || data.error || data.message || "OAuth provider request failed",
    );
  }
  return data;
}

async function appleClientSecret(values) {
  const privateKey = await importPKCS8(values.privateKey, "ES256");
  return new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: values.keyId })
    .setIssuer(values.teamId)
    .setAudience("https://appleid.apple.com")
    .setSubject(values.clientId)
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(privateKey);
}

async function exchangeCode(provider, code, verifier) {
  const values = config.oauth[provider];
  const redirectUri = callbackUrl(provider);
  let body;
  const headers = { "Content-Type": "application/x-www-form-urlencoded" };

  if (provider === "github") {
    body = new URLSearchParams({
      client_id: values.clientId,
      client_secret: values.clientSecret,
      code,
      redirect_uri: redirectUri,
    });
  } else if (provider === "x") {
    headers.Authorization = `Basic ${Buffer.from(`${values.clientId}:${values.clientSecret}`).toString("base64")}`;
    body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: verifier,
    });
  } else {
    body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: values.clientId,
      client_secret: provider === "apple"
        ? await appleClientSecret(values)
        : values.clientSecret,
      code_verifier: verifier,
    });
  }

  const token = await fetchJson(providerDefinitions[provider].tokenUrl, {
    method: "POST",
    headers,
    body,
  });
  if (!token.access_token && !token.id_token) {
    throw new AppError(502, "OAUTH_TOKEN_MISSING", "OAuth provider did not return a token");
  }
  return token;
}

async function loadProfile(provider, token, callbackBody) {
  if (provider === "google") {
    const profile = await fetchJson("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    return {
      providerAccountId: profile.sub,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.picture,
    };
  }

  if (provider === "github") {
    const profile = await fetchJson("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        Accept: "application/vnd.github+json",
      },
    });
    let email = profile.email;
    if (!email) {
      const emails = await fetchJson("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          Accept: "application/vnd.github+json",
        },
      });
      email = emails.find((item) => item.primary && item.verified)?.email
        || emails.find((item) => item.verified)?.email
        || null;
    }
    return {
      providerAccountId: String(profile.id),
      email,
      name: profile.name || profile.login,
      avatarUrl: profile.avatar_url,
    };
  }

  if (provider === "x") {
    const result = await fetchJson(
      "https://api.x.com/2/users/me?user.fields=profile_image_url,username,name,verified",
      { headers: { Authorization: `Bearer ${token.access_token}` } },
    );
    return {
      providerAccountId: result.data.id,
      email: null,
      name: result.data.name || `@${result.data.username}`,
      avatarUrl: result.data.profile_image_url,
    };
  }

  if (provider === "apple") {
    if (!token.id_token) {
      throw new AppError(502, "APPLE_ID_TOKEN_MISSING", "Apple did not return an identity token");
    }
    const { payload } = await jwtVerify(token.id_token, appleJwks, {
      issuer: "https://appleid.apple.com",
      audience: config.oauth.apple.clientId,
    });
    let appleUser = callbackBody?.user;
    if (typeof appleUser === "string") {
      try {
        appleUser = JSON.parse(appleUser);
      } catch {
        appleUser = null;
      }
    }
    const appleName = appleUser
      ? [appleUser.name?.firstName, appleUser.name?.lastName].filter(Boolean).join(" ")
      : "";
    return {
      providerAccountId: payload.sub,
      email: payload.email || null,
      name: appleName || payload.email?.split("@")[0] || "Apple user",
      avatarUrl: null,
    };
  }

  throw new AppError(500, "PROVIDER_UNSUPPORTED", "OAuth provider is not supported");
}

export async function completeOAuth(provider, params, callbackBody) {
  requireProvider(provider);
  const stateRow = consumeOAuthState(params.state, provider);
  if (params.error) {
    throw new AppError(400, "OAUTH_DENIED", params.error_description || params.error);
  }
  if (!params.code) {
    throw new AppError(400, "OAUTH_CODE_MISSING", "OAuth authorization code is missing");
  }

  const token = await exchangeCode(provider, params.code, stateRow.verifier);
  const profile = await loadProfile(provider, token, callbackBody);
  return { profile, redirectTo: stateRow.redirect_to };
}
