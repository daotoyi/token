import nodemailer from "nodemailer";
import { config } from "./config.js";
import { AppError } from "./http.js";

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  if (config.smtp.host) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: config.smtp.user
        ? { user: config.smtp.user, pass: config.smtp.pass }
        : undefined,
    });
    return transporter;
  }

  if (config.hasSendmail) {
    transporter = nodemailer.createTransport({
      sendmail: true,
      newline: "unix",
      path: config.sendmailPath,
    });
    return transporter;
  }

  throw new AppError(
    503,
    "EMAIL_NOT_CONFIGURED",
    "Email delivery is not configured on this server",
  );
}

export function mailDeliveryMode() {
  if (config.resendApiKey) return "resend";
  if (config.smtp.host) return "smtp";
  if (config.emailDevMode) return "development";
  if (config.hasSendmail) return "sendmail";
  return "unconfigured";
}

export async function sendVerificationCode({ email, code, language = "en" }) {
  if (config.emailDevMode) {
    console.log(`[dytoken-api] development verification code for ${email}: ${code}`);
    return;
  }
  const isChinese = language === "zh";
  const subject = isChinese ? `${code} 是您的 DyToken 验证码` : `${code} is your DyToken code`;
  const intro = isChinese
    ? "使用以下验证码完成注册或登录。验证码 10 分钟内有效。"
    : "Use the code below to finish signing in or creating your account. It expires in 10 minutes.";
  const notice = isChinese
    ? "如果不是您本人操作，请忽略这封邮件。"
    : "If you did not request this email, you can safely ignore it.";
  const text = `${intro}\n\n${code}\n\n${notice}\n\nDyToken`;
  const html = `
    <!doctype html>
    <html>
      <body style="margin:0;background:#f7f5ef;color:#171612;font-family:Arial,'PingFang SC',sans-serif">
        <div style="max-width:520px;margin:0 auto;padding:38px 20px">
          <div style="font-size:20px;font-weight:800;margin-bottom:28px">DyToken</div>
          <div style="background:#fff;border:1px solid #dedad1;border-radius:10px;padding:28px">
            <p style="margin:0 0 20px;line-height:1.7;color:#555249">${intro}</p>
            <div style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:34px;font-weight:800;letter-spacing:8px;color:#dc4e1b;padding:18px 0">${code}</div>
            <p style="margin:20px 0 0;font-size:13px;line-height:1.7;color:#89857a">${notice}</p>
          </div>
          <p style="margin:20px 0 0;font-size:11px;color:#89857a">DyToken · token.dyinvest.cn</p>
        </div>
      </body>
    </html>`;

  const message = {
    from: config.mailFrom,
    to: email,
    subject,
    text,
    html,
  };

  if (config.resendApiKey) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new AppError(
        502,
        "EMAIL_DELIVERY_FAILED",
        result.message || "The email provider rejected the message",
      );
    }
    return;
  }

  await getTransporter().sendMail(message);
}
