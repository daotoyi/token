import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { config } from "./config.js";
import { cleanupExpiredRecords } from "./db.js";
import {
  clearSessionCookie,
  createEmailVerification,
  createSession,
  getSessionUser,
  revokeSession,
  setSessionCookie,
  upsertOAuthUser,
  verifyEmailCode,
} from "./auth-service.js";
import { AppError, assertSameOrigin, asyncRoute } from "./http.js";
import { mailDeliveryMode, sendVerificationCode } from "./mailer.js";
import {
  beginOAuth,
  completeOAuth,
  getProviderStatus,
} from "./oauth.js";

const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "64kb" }));
app.use(express.urlencoded({ extended: false, limit: "64kb" }));
app.use(cookieParser());

function requestContext(req) {
  return {
    requestIp: req.ip,
    userAgent: String(req.get("user-agent") || "").slice(0, 300),
  };
}

function requireSameOrigin(req, _res, next) {
  if (!assertSameOrigin(req)) {
    return next(new AppError(403, "ORIGIN_REJECTED", "Request origin is not allowed"));
  }
  return next();
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "dytoken-auth",
    mail: mailDeliveryMode(),
    time: new Date().toISOString(),
  });
});

app.get("/api/auth/session", (req, res) => {
  res.json({
    user: getSessionUser(req),
    providers: getProviderStatus(),
    emailConfigured: mailDeliveryMode() !== "unconfigured",
  });
});

app.post(
  "/api/auth/email/request",
  requireSameOrigin,
  asyncRoute(async (req, res) => {
    const { email, intent, name, language } = req.body || {};
    const context = requestContext(req);
    const verification = createEmailVerification({
      email,
      intent,
      name,
      requestIp: context.requestIp,
    });

    await sendVerificationCode({
      email: verification.email,
      code: verification.code,
      language: ["zh", "zh-Hant"].includes(language) ? language : "en",
    });

    res.json({
      ok: true,
      email: verification.email,
      expiresAt: new Date(verification.expiresAt).toISOString(),
      resendAfter: 60,
      delivery: mailDeliveryMode(),
      ...(process.env.NODE_ENV !== "production"
        ? { devCode: verification.code }
        : {}),
    });
  }),
);

app.post(
  "/api/auth/email/verify",
  requireSameOrigin,
  asyncRoute(async (req, res) => {
    const { email, code } = req.body || {};
    const result = verifyEmailCode({ email, code });
    const context = requestContext(req);
    const session = createSession({ userId: result.user.id, ...context });
    setSessionCookie(res, session);
    res.json({ ok: true, ...result, expiresAt: new Date(session.expiresAt).toISOString() });
  }),
);

app.post("/api/auth/logout", requireSameOrigin, (req, res) => {
  revokeSession(req);
  clearSessionCookie(res);
  res.json({ ok: true });
});

app.get(
  "/api/auth/oauth/:provider/start",
  asyncRoute(async (req, res) => {
    const url = beginOAuth(req.params.provider, req.query.redirect);
    res.redirect(url);
  }),
);

async function oauthCallback(req, res) {
  const provider = req.params.provider;
  try {
    const result = await completeOAuth(provider, { ...req.query, ...req.body }, req.body);
    const account = upsertOAuthUser({
      provider,
      providerAccountId: result.profile.providerAccountId,
      email: result.profile.email,
      name: result.profile.name,
      avatarUrl: result.profile.avatarUrl,
    });
    const session = createSession({ userId: account.user.id, ...requestContext(req) });
    setSessionCookie(res, session);
    const destination = result.redirectTo.replace(/^\//, "");
    res.redirect(`${config.publicOrigin}/#/${destination}?auth=success`);
  } catch (error) {
    const code = error instanceof AppError ? error.code : "OAUTH_FAILED";
    res.redirect(`${config.publicOrigin}/#/?auth=error&code=${encodeURIComponent(code)}`);
  }
}

app.get("/api/auth/oauth/:provider/callback", asyncRoute(oauthCallback));
app.post("/api/auth/oauth/:provider/callback", asyncRoute(oauthCallback));

app.use("/api", (_req, _res, next) => {
  next(new AppError(404, "NOT_FOUND", "API endpoint not found"));
});

app.use((error, _req, res, _next) => {
  const status = error instanceof AppError ? error.status : 500;
  const code = error instanceof AppError ? error.code : "INTERNAL_ERROR";
  if (status >= 500) {
    console.error("[dytoken-api]", error);
  }
  res.status(status).json({
    ok: false,
    error: {
      code,
      message: status >= 500 && !(error instanceof AppError)
        ? "An unexpected error occurred"
        : error.message,
      ...(error instanceof AppError && error.details ? { details: error.details } : {}),
    },
  });
});

cleanupExpiredRecords();
const cleanupTimer = setInterval(cleanupExpiredRecords, 60 * 60 * 1000);
cleanupTimer.unref();

const server = app.listen(config.port, "127.0.0.1", () => {
  console.log(`[dytoken-api] listening on 127.0.0.1:${config.port}`);
  console.log(`[dytoken-api] email delivery: ${mailDeliveryMode()}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
