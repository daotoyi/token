import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Copy,
  Github,
  Languages,
  Menu,
  Moon,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import { providers } from "./data";
import { useI18n } from "./i18n";

export function BrandMark({ compact = false }) {
  return (
    <span className={`brand ${compact ? "brand--compact" : ""}`}>
      <span className="brand__glyph" aria-hidden="true">
        <span />
        <span />
      </span>
      {!compact && <span className="brand__word">DyToken</span>}
    </span>
  );
}

export function ProviderMark({ provider, size = "md" }) {
  const info = providers[provider] || providers.OpenAI;
  return (
    <span
      className={`provider-mark provider-mark--${size}`}
      style={{ "--provider-color": info.color, "--provider-soft": info.soft }}
      aria-label={provider}
      title={provider}
    >
      {info.mark}
    </span>
  );
}

export function ModelMark({ model, size = "md" }) {
  return (
    <span
      className={`model-mark model-mark--${size}`}
      style={{ "--model-color": model.color }}
      aria-hidden="true"
    >
      <ProviderMark provider={model.provider} size={size} />
    </span>
  );
}

export function LogoCloud() {
  const { t } = useI18n();
  return (
    <div className="logo-cloud" aria-label={t("Supported model providers")}>
      {Object.keys(providers).map((provider) => (
        <span className="logo-cloud__item" key={provider}>
          <ProviderMark provider={provider} size="sm" />
          <span>{provider}</span>
        </span>
      ))}
    </div>
  );
}

const navItems = [
  ["models", "Models"],
  ["playground", "Chat"],
  ["dashboard", "API"],
  ["docs", "Docs"],
  ["pricing", "Pricing"],
];

export function Header({ page, onNavigate, onLogin, theme, onTheme }) {
  const { language, setLanguage, t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [page]);

  const go = (target) => {
    onNavigate(target);
    setMobileOpen(false);
  };

  return (
    <>
      <div className="announcement">
        <span className="announcement__dot" />
        {t("DeepSeek V3.2 is now live")}
        <button onClick={() => go("models")}>
          {t("Explore model")} <ArrowRight size={13} strokeWidth={2} />
        </button>
      </div>
      <header className="site-header">
        <div className="site-header__inner">
          <button className="logo-button" onClick={() => go("home")} aria-label={t("DyToken home")}>
            <BrandMark />
          </button>
          <nav className="desktop-nav" aria-label={t("Primary navigation")}>
            {navItems.map(([target, label]) => (
              <button
                key={target}
                className={page === target ? "is-active" : ""}
                onClick={() => go(target)}
              >
                {t(label)}
              </button>
            ))}
          </nav>
          <div className="header-actions">
            <button className="icon-button theme-toggle" onClick={onTheme} aria-label={t("Toggle theme")}>
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button
              className="language-toggle"
              onClick={() => setLanguage(language === "en" ? "zh" : "en")}
              aria-label={language === "en" ? "切换至中文" : "Switch to English"}
            >
              <Languages size={15} />
              {language === "en" ? "中文" : "EN"}
            </button>
            <button className="text-button" onClick={onLogin}>
              {t("Sign in")}
            </button>
            <button className="button button--dark button--small" onClick={() => go("playground")}>
              {t("Start building")} <ArrowRight size={15} />
            </button>
            <button
              className="icon-button mobile-menu-button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={t("Toggle navigation")}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <nav className="mobile-nav" aria-label={t("Mobile navigation")}>
            {navItems.map(([target, label]) => (
              <button
                key={target}
                className={page === target ? "is-active" : ""}
                onClick={() => go(target)}
              >
                {t(label)}
                <ArrowRight size={16} />
              </button>
            ))}
            <button onClick={onLogin}>{t("Sign in")}</button>
            <button className="button button--orange" onClick={() => go("playground")}>
              {t("Start building")} <ArrowRight size={16} />
            </button>
          </nav>
        )}
      </header>
    </>
  );
}

export function Footer({ onNavigate, onLogin }) {
  const { t } = useI18n();
  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="footer__brand">
          <BrandMark />
          <p>{t("Every frontier model, behind one fast and reliable endpoint.")}</p>
          <div className="footer__status">
            <span className="live-dot" /> {t("All systems operational")}
          </div>
        </div>
        <div className="footer__links">
          <div>
            <strong>{t("Product")}</strong>
            <button onClick={() => onNavigate("models")}>{t("Models")}</button>
            <button onClick={() => onNavigate("playground")}>{t("Playground")}</button>
            <button onClick={() => onNavigate("pricing")}>{t("Pricing")}</button>
            <button onClick={() => onNavigate("dashboard")}>{t("API keys")}</button>
          </div>
          <div>
            <strong>{t("Developers")}</strong>
            <button onClick={() => onNavigate("docs")}>{t("Documentation")}</button>
            <button onClick={() => onNavigate("docs")}>{t("API reference")}</button>
            <button onClick={() => onNavigate("models")}>{t("Model catalog")}</button>
            <button onClick={onLogin}>{t("Status")}</button>
          </div>
          <div>
            <strong>{t("Company")}</strong>
            <a href="https://github.com/daotoyi/token" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <button onClick={onLogin}>{t("Privacy")}</button>
            <button onClick={onLogin}>{t("Terms")}</button>
            <a href="mailto:hello@dyinvest.cn">{t("Contact")}</a>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <span>{t("© 2026 DyToken. All rights reserved.")}</span>
        <span>{t("Built for builders in Shanghai and everywhere.")}</span>
      </div>
    </footer>
  );
}

export function CodeBlock({ code, language = "bash", compact = false }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={`code-block ${compact ? "code-block--compact" : ""}`}>
      <div className="code-block__top">
        <span>{language}</span>
        <button onClick={copy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? t("Copied") : t("Copy")}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function SectionLabel({ children }) {
  return <div className="section-label">{children}</div>;
}

export function LoginModal({ open, onClose }) {
  const { t } = useI18n();
  const modalRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handler = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.classList.add("modal-open");
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.classList.remove("modal-open");
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="login-modal" ref={modalRef} role="dialog" aria-modal="true" aria-label={t("Sign in")}>
        <button className="modal-close" onClick={onClose} aria-label={t("Close")}>
          <X size={19} />
        </button>
        <BrandMark />
        <div className="login-modal__intro">
          <span className="mini-kicker">
            <Sparkles size={13} /> {t("Welcome back")}
          </span>
          <h2>{t("Build with every model.")}</h2>
          <p>{t("Sign in to manage API keys, usage, and model access.")}</p>
        </div>
        <button className="oauth-button">
          <Github size={18} /> {t("Continue with GitHub")}
        </button>
        <div className="or-divider"><span>{t("or")}</span></div>
        <label className="field">
          <span>{t("Email address")}</span>
          <input type="email" placeholder="you@company.com" />
        </label>
        <button className="button button--orange login-submit">{t("Continue with email")}</button>
        <p className="login-terms">
          {t("By continuing, you agree to our")} <a href="#terms">{t("Terms")}</a> {t("and")} <a href="#privacy">{t("Privacy Policy")}</a>.
        </p>
      </div>
    </div>
  );
}

export function SelectField({ label, value, onChange, children, className = "" }) {
  return (
    <label className={`field select-field ${className}`}>
      {label && <span>{label}</span>}
      <span className="select-field__control">
        <select value={value} onChange={onChange}>
          {children}
        </select>
        <ChevronDown size={15} />
      </span>
    </label>
  );
}
