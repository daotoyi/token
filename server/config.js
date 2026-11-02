import "dotenv/config";
import { existsSync } from "node:fs";

const publicOrigin = (process.env.PUBLIC_ORIGIN || "http://localhost:4173").replace(/\/$/, "");
const sendmailPath = process.env.SENDMAIL_PATH || "/usr/sbin/sendmail";

export const config = {
  port: Number(process.env.API_PORT || 4100),
  publicOrigin,
  apiOrigin: process.env.API_ORIGIN || publicOrigin,
  databasePath: process.env.DATABASE_PATH || "./data/auth.db",
  authSecret: process.env.AUTH_SECRET || "",
  sessionDays: Number(process.env.SESSION_DAYS || 30),
  codeTtlMinutes: Number(process.env.EMAIL_CODE_TTL_MINUTES || 10),
  mailFrom: process.env.MAIL_FROM || "DyToken <no-reply@dyinvest.cn>",
  resendApiKey: process.env.RESEND_API_KEY || "",
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
  sendmailPath,
  hasSendmail: process.env.ENABLE_SENDMAIL === "true" && existsSync(sendmailPath),
  emailDevMode: process.env.EMAIL_DEV_MODE === "true",
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID || "",
      teamId: process.env.APPLE_TEAM_ID || "",
      keyId: process.env.APPLE_KEY_ID || "",
      privateKey: (process.env.APPLE_PRIVATE_KEY || "").replaceAll("\\n", "\n"),
    },
    x: {
      clientId: process.env.X_CLIENT_ID || "",
      clientSecret: process.env.X_CLIENT_SECRET || "",
    },
  },
};

if (!config.authSecret) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is required in production");
  }
  config.authSecret = "dytoken-local-development-secret-change-me";
}
