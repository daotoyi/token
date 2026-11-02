import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Github,
  KeyRound,
  LoaderCircle,
  Mail,
  ShieldCheck,
  X as CloseIcon,
} from "lucide-react";
import { BrandMark } from "./components";
import { useAuth } from "./auth";
import { useI18n } from "./i18n";

function GoogleIcon() {
  return (
    <svg className="provider-brand-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.36l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.39 13.93A6.03 6.03 0 0 1 6.07 12c0-.67.12-1.32.32-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.61.39 3.13 1.04 4.55l3.35-2.62Z" />
      <path fill="#EA4335" d="M12 5.94c1.47 0 2.79.51 3.83 1.5l2.87-2.88A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="provider-brand-icon provider-brand-icon--apple" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M17.05 12.54c.02 2.17 1.9 2.9 1.92 2.91-.02.05-.3 1.03-1 2.03-.6.88-1.23 1.75-2.22 1.77-.97.02-1.28-.58-2.39-.58-1.1 0-1.45.56-2.37.6-.96.03-1.69-.95-2.3-1.82-1.25-1.8-2.2-5.1-.92-7.32a3.56 3.56 0 0 1 3.02-1.84c.94-.02 1.84.64 2.42.64.57 0 1.65-.79 2.78-.67.47.02 1.8.19 2.65 1.43-.07.04-1.58.93-1.59 2.85Zm-1.83-5.25c.5-.61.84-1.46.75-2.3-.73.03-1.61.49-2.14 1.1-.47.54-.88 1.4-.77 2.23.81.06 1.65-.42 2.16-1.03Z" />
    </svg>
  );
}

function ProviderIcon({ provider }) {
  if (provider === "google") return <GoogleIcon />;
  if (provider === "apple") return <AppleIcon />;
  if (provider === "github") return <Github size={19} />;
  return <span className="x-provider-mark">X</span>;
}

function errorText(code, t) {
  const messages = {
    INVALID_EMAIL: "Enter a valid email address.",
    EMAIL_NOT_CONFIGURED: "Email delivery is not configured yet.",
    CODE_RATE_LIMIT: "Please wait before requesting another code.",
    HOURLY_LIMIT: "Too many verification codes requested. Try again later.",
    INVALID_CODE: "Enter the 6-digit verification code.",
    CODE_NOT_FOUND: "Request a new verification code.",
    CODE_EXPIRED: "This code has expired. Request a new one.",
    CODE_ATTEMPTS: "Too many attempts. Request a new code.",
    CODE_INCORRECT: "The verification code is incorrect.",
    PROVIDER_NOT_CONFIGURED: "This sign-in provider is not configured yet.",
    ORIGIN_REJECTED: "This request was rejected for security reasons.",
  };
  return t(messages[code] || "Something went wrong. Please try again.");
}

export default function AuthModal({ open, onClose, initialMode = "login" }) {
  const { language, t } = useI18n();
  const {
    providers,
    emailConfigured,
    requestEmailCode,
    verifyEmailCode,
    startOAuth,
  } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!open) return;
    setMode(initialMode);
    setStep("email");
    setCode("");
    setError("");
    setInfo("");
    setLoading(false);
  }, [open, initialMode]);

  useEffect(() => {
    if (countdown <= 0) return undefined;
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  const providerList = useMemo(
    () => ["google", "apple", "github", "x"].map((id) => ({
      id,
      ...providers[id],
    })),
    [providers],
  );

  if (!open) return null;

  const sendCode = async (event) => {
    event?.preventDefault();
    setError("");
    setInfo("");
    if (!agreed) {
      setError(t("Please agree to the Terms and Privacy Policy."));
      return;
    }
    setLoading(true);
    try {
      const result = await requestEmailCode({
        email,
        name: mode === "register" ? name : undefined,
        intent: mode,
        language: document.documentElement.lang.startsWith("zh") ? "zh" : "en",
      });
      setEmail(result.email);
      setStep("code");
      setCountdown(result.resendAfter || 60);
      setInfo(result.devCode
        ? t("Development code: {code}", { code: result.devCode })
        : t("We sent a 6-digit code to {email}.", { email: result.email }));
    } catch (requestError) {
      setError(errorText(requestError.code, t));
    } finally {
      setLoading(false);
    }
  };

  const verify = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyEmailCode({ email, code });
      onClose();
    } catch (requestError) {
      setError(errorText(requestError.code, t));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setStep("email");
    setCode("");
    setError("");
    setInfo("");
  };

  return (
    <div
      className="modal-backdrop auth-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="modal-close" onClick={onClose} aria-label={t("Close")}>
          <CloseIcon size={19} />
        </button>
        <div className="auth-modal__brand"><BrandMark /></div>

        {step === "email" ? (
          <>
            <div className="auth-heading">
              <span className="mini-kicker"><KeyRound size={13} /> {t("Secure account access")}</span>
              <h2 id="auth-title">{mode === "register" ? t("Create your account") : t("Welcome back")}</h2>
              <p>{mode === "register"
                ? t("Start with one account for every model.")
                : t("Sign in to manage API keys, usage, and model access.")}</p>
            </div>

            <div className="auth-mode-tabs">
              <button className={mode === "login" ? "is-active" : ""} onClick={() => switchMode("login")}>
                {t("Sign in")}
              </button>
              <button className={mode === "register" ? "is-active" : ""} onClick={() => switchMode("register")}>
                {t("Create account")}
              </button>
            </div>

            <div className="oauth-grid">
              {providerList.map((provider) => (
                <button
                  key={provider.id}
                  className="oauth-button oauth-button--provider"
                  disabled={!provider.configured}
                  onClick={() => startOAuth(provider.id)}
                  title={!provider.configured ? t("Provider setup required") : provider.label}
                >
                  <ProviderIcon provider={provider.id} />
                  <span>{provider.id === "x" ? t("X (Twitter)") : provider.label}</span>
                  {!provider.configured && <em>{t("Setup")}</em>}
                </button>
              ))}
            </div>

            <div className="or-divider"><span>{t("or continue with email")}</span></div>

            <form className="auth-email-form" onSubmit={sendCode}>
              {mode === "register" && (
                <label className="field">
                  <span>{t("Name")}</span>
                  <input
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder={t("Your name")}
                  />
                </label>
              )}
              <label className="field">
                <span>{t("Email address")}</span>
                <span className="auth-input-with-icon">
                  <Mail size={16} />
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@company.com"
                    required
                  />
                </span>
              </label>
              <label className="auth-consent">
                <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />
                <span>
                  {t("I agree to the")} <a href="#terms">{t("Terms")}</a> {t("and")} <a href="#privacy">{t("Privacy Policy")}</a>{language === "zh" ? "。" : "."}
                </span>
              </label>
              {error && <div className="auth-error">{error}</div>}
              <button
                className="button button--orange auth-submit"
                type="submit"
                disabled={loading || !emailConfigured}
              >
                {loading ? <LoaderCircle className="spin" size={17} /> : <Mail size={17} />}
                {emailConfigured ? t("Send verification code") : t("Email delivery unavailable")}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>
          </>
        ) : (
          <>
            <button className="auth-back" onClick={() => { setStep("email"); setError(""); }}>
              <ArrowLeft size={15} /> {t("Change email")}
            </button>
            <div className="auth-heading auth-heading--code">
              <span className="auth-mail-icon"><Mail size={20} /></span>
              <h2 id="auth-title">{t("Check your email")}</h2>
              <p>{t("Enter the 6-digit code we sent to")} <strong>{email}</strong></p>
            </div>
            <form className="auth-code-form" onSubmit={verify}>
              <label className="field">
                <span>{t("Verification code")}</span>
                <input
                  className="auth-code-input"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  autoFocus
                  required
                />
              </label>
              {info && <div className="auth-info"><Check size={15} /> {info}</div>}
              {error && <div className="auth-error">{error}</div>}
              <button className="button button--orange auth-submit" disabled={loading || code.length !== 6}>
                {loading ? <LoaderCircle className="spin" size={17} /> : <ShieldCheck size={17} />}
                {t("Verify and continue")}
              </button>
              <button
                type="button"
                className="auth-resend"
                disabled={countdown > 0 || loading}
                onClick={sendCode}
              >
                {countdown > 0
                  ? t("Resend code in {seconds}s", { seconds: countdown })
                  : t("Resend code")}
              </button>
            </form>
          </>
        )}

        <div className="auth-security-note">
          <ShieldCheck size={15} />
          {t("Sessions are encrypted and stored in secure, HttpOnly cookies.")}
        </div>
      </div>
    </div>
  );
}
