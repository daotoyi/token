import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Braces,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Code2,
  Copy,
  FileJson,
  KeyRound,
  Layers3,
  LifeBuoy,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Terminal,
} from "lucide-react";
import { CodeBlock } from "../components";
import { codeExamples } from "../data";

const sidebar = [
  ["Getting started", ["Introduction", "Quickstart", "Authentication", "Models"]],
  ["API reference", ["Chat completions", "Responses", "Embeddings", "Streaming"]],
  ["Routing", ["Auto Router", "Provider routing", "Fallbacks", "Rate limits"]],
  ["Platform", ["API keys", "Usage & billing", "Errors", "Webhooks"]],
];

export default function Docs({ onNavigate }) {
  const [language, setLanguage] = useState("curl");
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <div className="docs-page">
      <div className="docs-topbar">
        <div className="container docs-topbar__inner">
          <div>
            <span className="docs-topbar__label"><BookOpen size={15} /> Documentation</span>
            <span className="docs-version">API v1</span>
          </div>
          <label className="docs-search">
            <Search size={16} />
            <input placeholder="Search documentation..." />
            <kbd>⌘ K</kbd>
          </label>
          <button className="docs-mobile-nav" onClick={() => setMobileNav((open) => !open)}>
            <Layers3 size={16} /> Contents <ChevronDown size={14} />
          </button>
        </div>
      </div>

      <div className="container docs-layout">
        <aside className={`docs-sidebar ${mobileNav ? "is-open" : ""}`}>
          <div className="docs-sidebar__welcome">
            <span><Sparkles size={15} /></span>
            <div><strong>New to DyToken?</strong><p>Start with the quickstart guide.</p></div>
            <ArrowRight size={14} />
          </div>
          {sidebar.map(([title, items]) => (
            <div className="docs-nav-group" key={title}>
              <strong>{title}</strong>
              {items.map((item) => (
                <a key={item} href={`#docs-${item.toLowerCase().replace(/\s/g, "-")}`} className={item === "Quickstart" ? "is-active" : ""}>
                  {item}
                  {item === "Chat completions" && <span>API</span>}
                </a>
              ))}
            </div>
          ))}
          <div className="docs-sidebar__help">
            <CircleHelp size={17} />
            <div><strong>Need help?</strong><p>Ask our developer community.</p></div>
            <ArrowUpRight size={14} />
          </div>
        </aside>

        <article className="docs-article">
          <div className="docs-breadcrumb">Documentation <ChevronRight size={13} /> Getting started <ChevronRight size={13} /> <span>Quickstart</span></div>
          <div className="docs-title">
            <span className="docs-title__icon"><Terminal size={22} /></span>
            <div>
              <h1>Quickstart</h1>
              <p>Get your first completion from any model in under five minutes.</p>
            </div>
          </div>
          <div className="docs-callout docs-callout--accent">
            <Sparkles size={18} />
            <div>
              <strong>One API. Every model.</strong>
              <p>DyToken is compatible with the OpenAI SDK. Use your existing code and change the base URL.</p>
            </div>
          </div>

          <section id="docs-quickstart">
            <div className="docs-section-number">01</div>
            <h2>Create an API key</h2>
            <p>Create a key in the API console, then add it to your environment as <code>DYTOKEN_API_KEY</code>.</p>
            <div className="docs-step">
              <span><KeyRound size={17} /></span>
              <div>
                <strong>Generate a key</strong>
                <p>Each key can have its own spend limit and model permissions.</p>
              </div>
              <button onClick={() => onNavigate("dashboard")}>Open console <ArrowRight size={14} /></button>
            </div>
          </section>

          <section id="docs-authentication">
            <div className="docs-section-number">02</div>
            <h2>Make your first request</h2>
            <p>Send a request with your API key in the Authorization header. All responses use the OpenAI-compatible schema.</p>
            <div className="docs-code">
              <div className="docs-code__tabs">
                {[
                  ["curl", "cURL", Terminal],
                  ["typescript", "TypeScript", Braces],
                  ["python", "Python", Code2],
                ].map(([id, label, Icon]) => (
                  <button key={id} className={language === id ? "is-active" : ""} onClick={() => setLanguage(id)}>
                    <Icon size={14} /> {label}
                  </button>
                ))}
              </div>
              <CodeBlock code={codeExamples[language]} language={language} />
            </div>
          </section>

          <section id="docs-models">
            <div className="docs-section-number">03</div>
            <h2>Choose a model</h2>
            <p>Change the model string to route to a different provider. Use Auto Router to choose dynamically per request.</p>
            <div className="docs-model-grid">
              <div><span className="docs-model-mark"><Sparkles size={16} /></span><strong>Frontier models</strong><p>GPT, Claude, Gemini, Grok, and more.</p></div>
              <div><span className="docs-model-mark"><Route size={16} /></span><strong>Smart routing</strong><p>Quality, speed, and cost optimized together.</p></div>
              <div><span className="docs-model-mark"><ShieldCheck size={16} /></span><strong>Automatic fallback</strong><p>Retry across providers without changing code.</p></div>
            </div>
            <div className="docs-inline-code"><span>MODEL ID</span><code>{`"anthropic/claude-sonnet-4.5"`}</code><Copy size={14} /></div>
            <button className="docs-model-link" onClick={() => onNavigate("models")}>Browse the full model catalog <ArrowRight size={14} /></button>
          </section>

          <section id="docs-chat-completions">
            <div className="docs-section-number">04</div>
            <h2>Stream a response</h2>
            <p>Set <code>stream: true</code> to receive server-sent token events. Streaming is supported for all compatible models.</p>
            <div className="docs-inline-code docs-inline-code--json">
              <span>REQUEST BODY</span>
              <code>{`{ "model": "openai/gpt-5", "stream": true }`}</code>
              <Copy size={14} />
            </div>
          </section>

          <div className="docs-next">
            <div><span>Next up</span><strong>Model routing</strong><p>Learn how Auto Router balances quality, latency, and cost.</p></div>
            <button>Continue reading <ArrowRight size={15} /></button>
          </div>

          <div className="docs-feedback">
            <span>Was this page helpful?</span>
            <button><Check size={14} /> Yes</button>
            <button>No</button>
            <a href="mailto:hello@dyinvest.cn"><LifeBuoy size={14} /> Get support</a>
          </div>
        </article>

        <aside className="docs-toc">
          <strong>ON THIS PAGE</strong>
          <a href="#docs-quickstart" className="is-active">Create an API key</a>
          <a href="#docs-authentication">Make a request</a>
          <a href="#docs-models">Choose a model</a>
          <a href="#docs-chat-completions">Stream a response</a>
          <div className="docs-toc__card">
            <FileJson size={18} />
            <strong>API reference</strong>
            <p>Explore endpoints, parameters, and response schemas.</p>
            <button>View reference <ArrowRight size={13} /></button>
          </div>
        </aside>
      </div>
    </div>
  );
}
