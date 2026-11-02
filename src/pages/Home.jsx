import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Braces,
  Check,
  ChevronRight,
  CircleDollarSign,
  Code2,
  Gauge,
  GitBranch,
  Globe2,
  Layers3,
  LockKeyhole,
  Route,
  Sparkles,
  TimerReset,
  Zap,
} from "lucide-react";
import { CodeBlock, LogoCloud, ModelMark, SectionLabel } from "../components";
import { codeExamples, models } from "../data";
import { useI18n } from "../i18n";

const routeModels = [
  { name: "Claude Sonnet 4.5", provider: "Anthropic", latency: "1.1s", cost: "$0.0094" },
  { name: "GPT-5", provider: "OpenAI", latency: "0.9s", cost: "$0.0061" },
  { name: "Gemini 2.5 Pro", provider: "Google", latency: "1.4s", cost: "$0.0058" },
];

function RouterConsole() {
  const { t } = useI18n();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return undefined;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % routeModels.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [paused]);

  const selected = routeModels[active];

  return (
    <div
      className="router-demo"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="router-demo__bar">
        <div className="window-dots" aria-hidden="true"><i /><i /><i /></div>
        <span className="router-demo__endpoint">api.dyinvest.cn/v1</span>
        <span className="status-pill"><span className="live-dot" /> {t("LIVE")}</span>
      </div>
      <div className="router-demo__body">
        <div className="prompt-line">
          <span className="prompt-line__icon"><Sparkles size={14} /></span>
          <span>{t("Build a go-to-market plan for an AI product launch.")}</span>
        </div>
        <div className="route-flow">
          <div className="route-node">
            <div className="route-node__head">
              <span className="route-icon"><GitBranch size={15} /></span>
              <div>
                <strong>{t("Auto Router")}</strong>
                <small>{t("Analyzing request")}</small>
              </div>
              <span className="route-cost">2.4K tokens</span>
            </div>
            <div className="route-tags">
              <span>{t("reasoning")}</span>
              <span>{t("long context")}</span>
              <span>{t("writing")}</span>
            </div>
          </div>
          <div className="route-connector">
            <span />
            <ChevronRight size={14} />
          </div>
          <div className="route-node route-node--selected">
            <div className="route-node__head">
              <ModelMark
                model={models.find((model) => model.name === selected.name)}
                size="sm"
              />
              <div>
                <strong>{selected.name}</strong>
                <small>{t("Best balance of quality + speed")}</small>
              </div>
              <span className="route-live"><span className="live-dot" /> 99.99%</span>
            </div>
            <div className="route-metrics">
              <span><TimerReset size={14} /> {selected.latency}</span>
              <span><CircleDollarSign size={14} /> {selected.cost}</span>
              <span><Activity size={14} /> 92 tok/s</span>
            </div>
          </div>
        </div>
        <div className="response-lines" aria-hidden="true">
          <span style={{ width: "92%" }} />
          <span style={{ width: "81%" }} />
          <span style={{ width: "87%" }} />
          <span style={{ width: "48%" }} />
        </div>
      </div>
      <div className="router-demo__footer">
        <div>
          <span className="logo-mesh-mini">
            {models.slice(0, 5).map((model) => (
              <ModelMark key={model.id} model={model} size="xs" />
            ))}
          </span>
          <strong>12</strong> {t("models considered")}
        </div>
        <span className="router-demo__savings">{t("Optimized")} <strong>+$0.024</strong></span>
      </div>
      <div className="floating-stat floating-stat--top">
        <span>{t("UPTIME")}</span>
        <strong>99.99%</strong>
        <small>{t("Last 90 days")}</small>
      </div>
      <div className="floating-stat floating-stat--bottom">
        <Zap size={16} />
        <div><strong>37ms</strong><small>{t("edge overhead")}</small></div>
      </div>
    </div>
  );
}

function Hero({ onNavigate }) {
  const { t } = useI18n();
  return (
    <section className="hero">
      <div className="hero__grid" aria-hidden="true" />
      <div className="container hero__inner">
        <div className="hero__copy">
          <span className="hero-kicker">
            <span className="live-dot" /> {t("Unified inference for every frontier model")}
          </span>
          <h1>
            {t("All the models.")}
            <br />
            <span className="accent-underline">{t("One API.")}</span>
          </h1>
          <p className="hero__lead">
            {t("Access GPT, Claude, Gemini, DeepSeek and more through a single, OpenAI-compatible endpoint. Route intelligently, switch instantly, and never manage another provider account.")}
          </p>
          <div className="hero__actions">
            <button className="button button--orange button--large" onClick={() => onNavigate("playground")}>
              {t("Try the playground")} <ArrowRight size={18} />
            </button>
            <button className="button button--outline button--large" onClick={() => onNavigate("docs")}>
              <Code2 size={18} /> {t("Read the docs")}
            </button>
          </div>
          <div className="hero__proof">
            <div className="proof-avatars">
              {models.slice(0, 4).map((model) => (
                <ModelMark key={model.id} model={model} size="xs" />
              ))}
            </div>
            <div>
              <div className="proof-stars">★★★★★ <strong>4.9</strong></div>
              <span>{t("Trusted by 38,000+ builders")}</span>
            </div>
          </div>
        </div>
        <div className="hero__visual">
          <RouterConsole />
        </div>
      </div>
      <div className="provider-strip">
        <div className="container provider-strip__inner">
          <span>{t("ONE ENDPOINT FOR")}</span>
          <LogoCloud />
        </div>
      </div>
    </section>
  );
}

function MetricsBand() {
  const { t } = useI18n();
  return (
    <section className="metrics-band">
      <div className="container metrics">
        <div><strong>300+</strong><span>{t("Available models")}</span></div>
        <div><strong>99.99%</strong><span>{t("Gateway uptime")}</span></div>
        <div><strong>37ms</strong><span>{t("Median overhead")}</span></div>
        <div><strong>4.2B</strong><span>{t("Tokens routed daily")}</span></div>
      </div>
    </section>
  );
}

function IntegrationSection({ onNavigate }) {
  const { t } = useI18n();
  return (
    <section className="section integration-section">
      <div className="container">
        <div className="section-heading split-heading">
          <div>
            <SectionLabel>{t("One integration")}</SectionLabel>
            <h2>{t("Switch models without switching your code.")}</h2>
          </div>
          <div className="section-heading__aside">
            <p>{t("DyToken speaks the OpenAI API format. Change one string to route between providers, regions, and price tiers.")}</p>
            <button className="inline-link" onClick={() => onNavigate("docs")}>
              {t("Explore API docs")} <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
        <div className="integration-grid">
          <div className="integration-code">
            <div className="code-tabs">
              <span className="active">TypeScript</span><span>Python</span><span>cURL</span>
            </div>
            <CodeBlock code={codeExamples.typescript} language="typescript" />
            <div className="integration-code__note">
              <Check size={15} /> {t("Drop-in compatible with the OpenAI SDK")}
            </div>
          </div>
          <div className="capability-grid">
            <article>
              <span className="feature-icon"><Route size={19} /></span>
              <h3>{t("Intelligent routing")}</h3>
              <p>{t("Pick the best model per request using quality, speed, and your budget.")}</p>
              <div className="feature-meta">{t("AUTO ROUTER")} <ArrowRight size={14} /></div>
            </article>
            <article>
              <span className="feature-icon feature-icon--green"><TimerReset size={19} /></span>
              <h3>{t("Automatic fallback")}</h3>
              <p>{t("Requests reroute in milliseconds when a provider slows down or fails.")}</p>
              <div className="feature-meta">{t("ZERO DOWNTIME")} <ArrowRight size={14} /></div>
            </article>
            <article>
              <span className="feature-icon feature-icon--blue"><Gauge size={19} /></span>
              <h3>{t("Usage controls")}</h3>
              <p>{t("Track spend, latency, and token use across every model in one place.")}</p>
              <div className="feature-meta">{t("LIVE ANALYTICS")} <ArrowRight size={14} /></div>
            </article>
            <article>
              <span className="feature-icon feature-icon--yellow"><LockKeyhole size={19} /></span>
              <h3>{t("Private by default")}</h3>
              <p>{t("No prompt logging, no training on your data, and region-level controls.")}</p>
              <div className="feature-meta">{t("SOC 2 READY")} <ArrowRight size={14} /></div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

function ModelRanking({ onNavigate }) {
  const { t } = useI18n();
  const rankedModels = models.slice(0, 6);
  return (
    <section className="section model-ranking">
      <div className="container">
        <div className="section-heading split-heading">
          <div>
            <SectionLabel>{t("Live model catalog")}</SectionLabel>
            <h2>{t("The best models, measured side by side.")}</h2>
          </div>
          <div className="section-heading__aside">
            <p>{t("Real availability, pricing, and throughput across providers. Updated continuously.")}</p>
            <button className="inline-link" onClick={() => onNavigate("models")}>
              {t("Browse all models")} <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
        <div className="ranking-table">
          <div className="ranking-row ranking-row--head">
            <span>{t("Model")}</span><span>{t("Context")}</span><span>{t("Input / 1M")}</span><span>{t("Output / 1M")}</span><span>{t("Latency")}</span><span>{t("Trend")}</span>
          </div>
          {rankedModels.map((model, index) => (
            <button className="ranking-row" key={model.id} onClick={() => onNavigate("models")}>
              <span className="ranking-model">
                <small>{String(index + 1).padStart(2, "0")}</small>
                <ModelMark model={model} size="sm" />
                <span><strong>{model.name}</strong><small>{model.provider}</small></span>
                {model.badge && <em>{t(model.badge)}</em>}
              </span>
              <span>{model.context}</span>
              <span>${model.input.toFixed(2)}</span>
              <span>${model.output.toFixed(2)}</span>
              <span><i className="latency-dot" /> {model.latency}s</span>
              <span>
                <svg className="sparkline" viewBox="0 0 84 24" aria-hidden="true">
                  <path d={index % 2 ? "M1 19 C12 17, 16 8, 27 12 S44 18, 53 9 S70 4, 83 7" : "M1 18 C11 20, 17 11, 29 13 S45 9, 56 11 S72 5, 83 4"} />
                </svg>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProviderAdvantage({ onLogin }) {
  const { t } = useI18n();
  return (
    <section className="section advantage-section">
      <div className="container">
        <div className="advantage-copy">
          <SectionLabel>{t("Built for production")}</SectionLabel>
          <h2>{t("Provider choice, without provider lock-in.")}</h2>
          <p>{t("Your application should outlive any single model. DyToken gives you one contract across providers, so you can evolve your stack on your terms.")}</p>
          <ul className="check-list">
            <li><Check size={16} /> {t("300+ models from 60+ providers")}</li>
            <li><Check size={16} /> {t("Unified billing and spend controls")}</li>
            <li><Check size={16} /> {t("Global edge routing with smart failover")}</li>
            <li><Check size={16} /> {t("Team workspaces, roles, and audit logs")}</li>
          </ul>
          <button className="button button--dark" onClick={onLogin}>
            {t("Create your account")} <ArrowRight size={16} />
          </button>
        </div>
        <div className="network-visual" aria-label="Global routing network visualization">
          <div className="network-visual__head">
            <div><span className="live-dot" /> {t("Global gateway")}</div>
            <span>{t("LIVE")}</span>
          </div>
          <div className="network-map">
            <svg viewBox="0 0 620 390" role="img" aria-label="World routing map">
              <defs>
                <pattern id="dots" width="9" height="9" patternUnits="userSpaceOnUse">
                  <circle cx="1.4" cy="1.4" r="1.2" fill="currentColor" opacity=".16" />
                </pattern>
              </defs>
              <rect width="620" height="390" fill="url(#dots)" />
              <path className="map-land" d="M55 108l29-37 66-31 66 12 37 32-14 38-32 2-27 30-50 4-34 35-24-27-24-18 7-40Zm159 92 45-16 35 19 17 42-13 54-26 30-20-23-12-50-26-56Zm243-126 45 10 36 25 24 39-18 19-23-11-18 20-31-12-23-33 8-57Zm-7 113 32-22 24 11 10 34-14 31-28 9-23-24-1-39Z" />
              <path className="map-land" d="M301 224l28 14 5 39-19 12-26-25 12-40Zm124 99 32-10 22 17-20 22-34-8v-21Z" />
              <g className="map-lines">
                <path d="M148 139 C241 45, 410 65, 475 120" />
                <path d="M148 139 C250 177, 372 209, 426 311" />
                <path d="M475 120 C488 184, 462 248, 426 311" />
              </g>
              {[
                [148, 139, "us-east"],
                [475, 120, "eu-west"],
                [426, 311, "ap-east"],
                [328, 185, "edge"],
              ].map(([x, y, label], index) => (
                <g key={label} className={`map-node ${index === 3 ? "map-node--center" : ""}`}>
                  <circle cx={x} cy={y} r="18" className="map-node__pulse" />
                  <circle cx={x} cy={y} r="5.5" className="map-node__core" />
                  <text x={x + 11} y={y - 11}>{label}</text>
                </g>
              ))}
            </svg>
            <div className="network-panel network-panel--left">
              <small>{t("REQUESTS / MIN")}</small>
              <strong>18,492</strong>
              <span>↑ 12.4%</span>
            </div>
            <div className="network-panel network-panel--right">
              <small>{t("P95 LATENCY")}</small>
              <strong>842ms</strong>
              <span className="green">{t("Healthy")}</span>
            </div>
          </div>
          <div className="network-visual__footer">
            <span><Globe2 size={15} /> {t("18 regions active")}</span>
            <span><Layers3 size={15} /> {t("62 provider endpoints")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingTeaser({ onNavigate }) {
  const { t } = useI18n();
  return (
    <section className="section pricing-teaser">
      <div className="container pricing-teaser__inner">
        <div className="pricing-teaser__main">
          <SectionLabel>{t("Simple pricing")}</SectionLabel>
          <h2>{t("Pay only for what you actually use.")}</h2>
          <p>{t("No monthly minimum. No per-seat tax. Transparent provider pricing with one consolidated bill.")}</p>
          <div className="pricing-teaser__actions">
            <button className="button button--orange" onClick={() => onNavigate("pricing")}>
              {t("View pricing")} <ArrowRight size={16} />
            </button>
            <span><Check size={14} /> {t("$5 free credit")}</span>
          </div>
        </div>
        <div className="pricing-cards">
          <div className="price-card">
            <span>{t("PAY AS YOU GO")}</span>
            <strong><sup>$</sup>0</strong>
            <p>{t("Monthly platform fee")}</p>
            <ul>
              <li><Check size={14} /> {t("All models")}</li>
              <li><Check size={14} /> {t("Usage analytics")}</li>
              <li><Check size={14} /> {t("Smart routing")}</li>
            </ul>
          </div>
          <div className="price-card price-card--accent">
            <div className="price-card__label">{t("BUILDER PLAN")}</div>
            <span>{t("FOR GROWING TEAMS")}</span>
            <strong><sup>$</sup>29<small>{t("/mo")}</small></strong>
            <p>{t("Higher limits, volume discounts")}</p>
            <ul>
              <li><Check size={14} /> {t("5 team members")}</li>
              <li><Check size={14} /> {t("5% routing discount")}</li>
              <li><Check size={14} /> {t("Priority support")}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ onNavigate }) {
  const { t } = useI18n();
  return (
    <section className="final-cta">
      <div className="container final-cta__inner">
        <span className="final-cta__orb"><Braces size={24} /></span>
        <div>
          <SectionLabel>{t("Ready when you are")}</SectionLabel>
          <h2>{t("Build once. Route everywhere.")}</h2>
        </div>
        <div className="final-cta__actions">
          <button className="button button--orange button--large" onClick={() => onNavigate("playground")}>
            {t("Start building")} <ArrowRight size={18} />
          </button>
          <button className="button button--outline-light button--large" onClick={() => onNavigate("docs")}>
            {t("View documentation")}
          </button>
        </div>
      </div>
    </section>
  );
}

export default function Home({ onNavigate, onLogin }) {
  return (
    <div className="home-page">
      <Hero onNavigate={onNavigate} />
      <MetricsBand />
      <IntegrationSection onNavigate={onNavigate} />
      <ModelRanking onNavigate={onNavigate} />
      <ProviderAdvantage onLogin={onLogin} />
      <PricingTeaser onNavigate={onNavigate} />
      <FinalCTA onNavigate={onNavigate} />
    </div>
  );
}
