import { createHash, createHmac, randomBytes, randomInt, randomUUID } from "node:crypto";
import { config } from "./config.js";
import { db } from "./db.js";
import { AppError } from "./http.js";

const SESSION_COOKIE = "dytoken_session";
const nowSeconds = () => Date.now();

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function hashCode(email, code) {
  return createHmac("sha256", config.authSecret)
    .update(`${normalizeEmail(email)}:${code}`)
    .digest("hex");
}

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatar_url,
    emailVerified: Boolean(user.email_verified_at),
    createdAt: new Date(user.created_at).toISOString(),
  };
}

export function findUserById(id) {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
}

export function findUserByEmail(email) {
  return db.prepare("SELECT * FROM users WHERE email = ? COLLATE NOCASE").get(normalizeEmail(email));
}

export function createEmailVerification({ email, intent, name, requestIp }) {
  const normalizedEmail = normalizeEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new AppError(400, "INVALID_EMAIL", "Enter a valid email address");
  }

  const now = nowSeconds();
  const recent = db.prepare(
    "SELECT created_at FROM email_codes WHERE email = ? COLLATE NOCASE ORDER BY created_at DESC LIMIT 1",
  ).get(normalizedEmail);
  if (recent && now - recent.created_at < 60_000) {
    throw new AppError(429, "CODE_RATE_LIMIT", "Please wait before requesting another code", {
      retryAfter: Math.ceil((60_000 - (now - recent.created_at)) / 1000),
    });
  }

  const hourlyCount = db.prepare(
    "SELECT COUNT(*) AS count FROM email_codes WHERE email = ? COLLATE NOCASE AND created_at > ?",
  ).get(normalizedEmail, now - 60 * 60 * 1000).count;
  if (hourlyCount >= 5) {
    throw new AppError(429, "HOURLY_LIMIT", "Too many verification codes requested");
  }

  const code = String(randomInt(100000, 1_000_000));
  const expiresAt = now + config.codeTtlMinutes * 60 * 1000;
  db.prepare(`
    INSERT INTO email_codes (email, code_hash, intent, name, expires_at, created_at, request_ip)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    normalizedEmail,
    hashCode(normalizedEmail, code),
    intent === "register" ? "register" : "login",
    String(name || "").trim().slice(0, 80) || null,
    expiresAt,
    now,
    requestIp || null,
  );

  return { email: normalizedEmail, code, expiresAt };
}

export function verifyEmailCode({ email, code }) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedCode = String(code || "").replace(/\D/g, "");
  if (!/^\d{6}$/.test(normalizedCode)) {
    throw new AppError(400, "INVALID_CODE", "Enter the 6-digit verification code");
  }

  const record = db.prepare(`
    SELECT * FROM email_codes
    WHERE email = ? COLLATE NOCASE AND consumed_at IS NULL
    ORDER BY created_at DESC LIMIT 1
  `).get(normalizedEmail);
  if (!record) {
    throw new AppError(400, "CODE_NOT_FOUND", "Request a new verification code");
  }
  if (record.expires_at < Date.now()) {
    throw new AppError(400, "CODE_EXPIRED", "This verification code has expired");
  }
  if (record.attempts >= 5) {
    throw new AppError(429, "CODE_ATTEMPTS", "Too many attempts. Request a new code.");
  }

  if (record.code_hash !== hashCode(normalizedEmail, normalizedCode)) {
    db.prepare("UPDATE email_codes SET attempts = attempts + 1 WHERE id = ?").run(record.id);
    throw new AppError(400, "CODE_INCORRECT", "The verification code is incorrect");
  }

  db.prepare("UPDATE email_codes SET consumed_at = ? WHERE id = ?").run(Date.now(), record.id);

  const now = Date.now();
  let user = findUserByEmail(normalizedEmail);
  let isNew = false;
  if (!user) {
    isNew = true;
    const name = record.name || normalizedEmail.split("@")[0];
    const id = randomUUID();
    db.prepare(`
      INSERT INTO users (id, email, name, email_verified_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, normalizedEmail, name, now, now, now);
    user = findUserById(id);
  } else if (!user.email_verified_at) {
    db.prepare("UPDATE users SET email_verified_at = ?, updated_at = ? WHERE id = ?")
      .run(now, now, user.id);
    user = findUserById(user.id);
  }

  return { user: publicUser(user), isNew };
}

export function createSession({ userId, requestIp, userAgent }) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = Date.now() + config.sessionDays * 24 * 60 * 60 * 1000;
  db.prepare(`
    INSERT INTO sessions (token_hash, user_id, expires_at, created_at, request_ip, user_agent)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(hashToken(token), userId, expiresAt, Date.now(), requestIp || null, userAgent || null);
  return { token, expiresAt };
}

export function setSessionCookie(res, session) {
  res.cookie(SESSION_COOKIE, session.token, {
    httpOnly: true,
    secure: config.publicOrigin.startsWith("https://"),
    sameSite: "lax",
    path: "/",
    expires: new Date(session.expiresAt),
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    secure: config.publicOrigin.startsWith("https://"),
    sameSite: "lax",
    path: "/",
  });
}

export function getSessionUser(req) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) return null;
  const row = db.prepare(`
    SELECT users.* FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > ?
  `).get(hashToken(token), Date.now());
  return row ? publicUser(row) : null;
}

export function revokeSession(req) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (token) {
    db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
  }
}

export function upsertOAuthUser({ provider, providerAccountId, email, name, avatarUrl }) {
  const normalizedEmail = email ? normalizeEmail(email) : null;
  const now = Date.now();
  const existingAccount = db.prepare(`
    SELECT users.* FROM oauth_accounts
    JOIN users ON users.id = oauth_accounts.user_id
    WHERE oauth_accounts.provider = ? AND oauth_accounts.provider_account_id = ?
  `).get(provider, String(providerAccountId));
  if (existingAccount) {
    db.prepare(`
      UPDATE users SET name = COALESCE(?, name), avatar_url = COALESCE(?, avatar_url), updated_at = ?
      WHERE id = ?
    `).run(name || null, avatarUrl || null, now, existingAccount.id);
    return { user: publicUser(findUserById(existingAccount.id)), isNew: false };
  }

  let user = normalizedEmail ? findUserByEmail(normalizedEmail) : null;
  let isNew = false;
  if (!user) {
    isNew = true;
    const id = randomUUID();
    db.prepare(`
      INSERT INTO users (id, email, name, avatar_url, email_verified_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      normalizedEmail,
      name || normalizedEmail?.split("@")[0] || `${provider} user`,
      avatarUrl || null,
      normalizedEmail ? now : null,
      now,
      now,
    );
    user = findUserById(id);
  } else {
    db.prepare(`
      UPDATE users SET
        name = COALESCE(name, ?),
        avatar_url = COALESCE(?, avatar_url),
        email_verified_at = COALESCE(email_verified_at, ?),
        updated_at = ?
      WHERE id = ?
    `).run(name || null, avatarUrl || null, normalizedEmail ? now : null, now, user.id);
    user = findUserById(user.id);
  }

  db.prepare(`
    INSERT INTO oauth_accounts
      (id, user_id, provider, provider_account_id, provider_email, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(randomUUID(), user.id, provider, String(providerAccountId), normalizedEmail, now);

  return { user: publicUser(user), isNew };
}
