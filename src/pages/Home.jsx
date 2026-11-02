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

const routeModels = [
  { name: "Claude Sonnet 4.5", provider: "Anthropic", latency: "1.1s", cost: "$0.0094" },
  { name: "GPT-5", provider: "OpenAI", latency: "0.9s", cost: "$0.0061" },
  { name: "Gemini 2.5 Pro", provider: "Google", latency: "1.4s", cost: "$0.0058" },
];

function RouterConsole() {
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
        <span className="status-pill"><span className="live-dot" /> Live</span>
      </div>
      <div className="router-demo__body">
        <div className="prompt-line">
          <span className="prompt-line__icon"><Sparkles size={14} /></span>
          <span>Build a go-to-market plan for an AI product launch.</span>
        </div>
        <div className="route-flow">
          <div className="route-node">
            <div className="route-node__head">
              <span className="route-icon"><GitBranch size={15} /></span>
              <div>
                <strong>Auto Router</strong>
                <small>Analyzing request</small>
              </div>
              <span className="route-cost">2.4K tokens</span>
            </div>
            <div className="route-tags">
              <span>reasoning</span>
              <span>long context</span>
              <span>writing</span>
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
                <small>Best balance of quality + speed</small>
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
          <strong>12</strong> models considered
        </div>
        <span className="router-demo__savings">Optimized <strong>+$0.024</strong></span>
      </div>
      <div className="floating-stat floating-stat--top">
        <span>UPTIME</span>
        <strong>99.99%</strong>
        <small>Last 90 days</small>
      </div>
      <div className="floating-stat floating-stat--bottom">
        <Zap size={16} />
        <div><strong>37ms</strong><small>edge overhead</small></div>
      </div>
    </div>
  );
}

function Hero({ onNavigate }) {
  return (
    <section className="hero">
      <div className="hero__grid" aria-hidden="true" />
      <div className="container hero__inner">
        <div className="hero__copy">
          <span className="hero-kicker">
            <span className="live-dot" /> Unified inference for every frontier model
          </span>
          <h1>
            All the models.
            <br />
            <span className="accent-underline">One API.</span>
          </h1>
          <p className="hero__lead">
            Access GPT, Claude, Gemini, DeepSeek and more through a single,
            OpenAI-compatible endpoint. Route intelligently, switch instantly,
            and never manage another provider account.
          </p>
          <div className="hero__actions">
            <button className="button button--orange button--large" onClick={() => onNavigate("playground")}>
              Try the playground <ArrowRight size={18} />
            </button>
            <button className="button button--outline button--large" onClick={() => onNavigate("docs")}>
              <Code2 size={18} /> Read the docs
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
              <span>Trusted by 38,000+ builders</span>
            </div>
          </div>
        </div>
        <div className="hero__visual">
          <RouterConsole />
        </div>
      </div>
      <div className="provider-strip">
        <div className="container provider-strip__inner">
          <span>ONE ENDPOINT FOR</span>
          <LogoCloud />
        </div>
      </div>
    </section>
  );
}

function MetricsBand() {
  return (
    <section className="metrics-band">
      <div className="container metrics">
        <div><strong>300+</strong><span>Available models</span></div>
        <div><strong>99.99%</strong><span>Gateway uptime</span></div>
        <div><strong>37ms</strong><span>Median overhead</span></div>
        <div><strong>4.2B</strong><span>Tokens routed daily</span></div>
      </div>
    </section>
  );
}

function IntegrationSection({ onNavigate }) {
  return (
    <section className="section integration-section">
      <div className="container">
        <div className="section-heading split-heading">
          <div>
            <SectionLabel>One integration</SectionLabel>
            <h2>Switch models without<br />switching your code.</h2>
          </div>
          <div className="section-heading__aside">
            <p>
              DyToken speaks the OpenAI API format. Change one string to route
              between providers, regions, and price tiers.
            </p>
            <button className="inline-link" onClick={() => onNavigate("docs")}>
              Explore API docs <ArrowUpRight size={16} />
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
              <Check size={15} /> Drop-in compatible with the OpenAI SDK
            </div>
          </div>
          <div className="capability-grid">
            <article>
              <span className="feature-icon"><Route size={19} /></span>
              <h3>Intelligent routing</h3>
              <p>Pick the best model per request using quality, speed, and your budget.</p>
              <div className="feature-meta">AUTO ROUTER <ArrowRight size={14} /></div>
            </article>
            <article>
              <span className="feature-icon feature-icon--green"><TimerReset size={19} /></span>
              <h3>Automatic fallback</h3>
              <p>Requests reroute in milliseconds when a provider slows down or fails.</p>
              <div className="feature-meta">ZERO DOWNTIME <ArrowRight size={14} /></div>
            </article>
            <article>
              <span className="feature-icon feature-icon--blue"><Gauge size={19} /></span>
              <h3>Usage controls</h3>
              <p>Track spend, latency, and token use across every model in one place.</p>
              <div className="feature-meta">LIVE ANALYTICS <ArrowRight size={14} /></div>
            </article>
            <article>
              <span className="feature-icon feature-icon--yellow"><LockKeyhole size={19} /></span>
              <h3>Private by default</h3>
              <p>No prompt logging, no training on your data, and region-level controls.</p>
              <div className="feature-meta">SOC 2 READY <ArrowRight size={14} /></div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

function ModelRanking({ onNavigate }) {
  const rankedModels = models.slice(0, 6);
  return (
    <section className="section model-ranking">
      <div className="container">
        <div className="section-heading split-heading">
          <div>
            <SectionLabel>Live model catalog</SectionLabel>
            <h2>The best models,<br />measured side by side.</h2>
          </div>
          <div className="section-heading__aside">
            <p>Real availability, pricing, and throughput across providers. Updated continuously.</p>
            <button className="inline-link" onClick={() => onNavigate("models")}>
              Browse all models <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
        <div className="ranking-table">
          <div className="ranking-row ranking-row--head">
            <span>Model</span><span>Context</span><span>Input / 1M</span><span>Output / 1M</span><span>Latency</span><span>Trend</span>
          </div>
          {rankedModels.map((model, index) => (
            <button className="ranking-row" key={model.id} onClick={() => onNavigate("models")}>
              <span className="ranking-model">
                <small>{String(index + 1).padStart(2, "0")}</small>
                <ModelMark model={model} size="sm" />
                <span><strong>{model.name}</strong><small>{model.provider}</small></span>
                {model.badge && <em>{model.badge}</em>}
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
  return (
    <section className="section advantage-section">
      <div className="container">
        <div className="advantage-copy">
          <SectionLabel>Built for production</SectionLabel>
          <h2>Provider choice,<br />without provider lock-in.</h2>
          <p>
            Your application should outlive any single model. DyToken gives you
            one contract across providers, so you can evolve your stack on your terms.
          </p>
          <ul className="check-list">
            <li><Check size={16} /> 300+ models from 60+ providers</li>
            <li><Check size={16} /> Unified billing and spend controls</li>
            <li><Check size={16} /> Global edge routing with smart failover</li>
            <li><Check size={16} /> Team workspaces, roles, and audit logs</li>
          </ul>
          <button className="button button--dark" onClick={onLogin}>
            Create your account <ArrowRight size={16} />
          </button>
        </div>
        <div className="network-visual" aria-label="Global routing network visualization">
          <div className="network-visual__head">
            <div><span className="live-dot" /> Global gateway</div>
            <span>LIVE</span>
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
              <small>REQUESTS / MIN</small>
              <strong>18,492</strong>
              <span>↑ 12.4%</span>
            </div>
            <div className="network-panel network-panel--right">
              <small>P95 LATENCY</small>
              <strong>842ms</strong>
              <span className="green">Healthy</span>
            </div>
          </div>
          <div className="network-visual__footer">
            <span><Globe2 size={15} /> 18 regions active</span>
            <span><Layers3 size={15} /> 62 provider endpoints</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingTeaser({ onNavigate }) {
  return (
    <section className="section pricing-teaser">
      <div className="container pricing-teaser__inner">
        <div className="pricing-teaser__main">
          <SectionLabel>Simple pricing</SectionLabel>
          <h2>Pay only for what<br />you actually use.</h2>
          <p>No monthly minimum. No per-seat tax. Transparent provider pricing with one consolidated bill.</p>
          <div className="pricing-teaser__actions">
            <button className="button button--orange" onClick={() => onNavigate("pricing")}>
              View pricing <ArrowRight size={16} />
            </button>
            <span><Check size={14} /> $5 free credit</span>
          </div>
        </div>
        <div className="pricing-cards">
          <div className="price-card">
            <span>PAY AS YOU GO</span>
            <strong><sup>$</sup>0</strong>
            <p>Monthly platform fee</p>
            <ul>
              <li><Check size={14} /> All models</li>
              <li><Check size={14} /> Usage analytics</li>
              <li><Check size={14} /> Smart routing</li>
            </ul>
          </div>
          <div className="price-card price-card--accent">
            <div className="price-card__label">BUILDER PLAN</div>
            <span>FOR GROWING TEAMS</span>
            <strong><sup>$</sup>29<small>/mo</small></strong>
            <p>Higher limits, volume discounts</p>
            <ul>
              <li><Check size={14} /> 5 team members</li>
              <li><Check size={14} /> 5% routing discount</li>
              <li><Check size={14} /> Priority support</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ onNavigate }) {
  return (
    <section className="final-cta">
      <div className="container final-cta__inner">
        <span className="final-cta__orb"><Braces size={24} /></span>
        <div>
          <SectionLabel>Ready when you are</SectionLabel>
          <h2>Build once. Route everywhere.</h2>
        </div>
        <div className="final-cta__actions">
          <button className="button button--orange button--large" onClick={() => onNavigate("playground")}>
            Start building <ArrowRight size={18} />
          </button>
          <button className="button button--outline-light button--large" onClick={() => onNavigate("docs")}>
            View documentation
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
