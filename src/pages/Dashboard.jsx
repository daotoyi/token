import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  CircleDollarSign,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileKey,
  Gauge,
  KeyRound,
  Layers3,
  LifeBuoy,
  LockKeyhole,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  SlidersHorizontal,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { CodeBlock, ModelMark } from "../components";
import { useAuth } from "../auth";
import { codeExamples, models, usageData } from "../data";
import { useI18n } from "../i18n";

const nav = [
  ["overview", "Overview", BarChart3],
  ["activity", "Activity", Activity],
  ["keys", "API keys", KeyRound],
  ["credits", "Credits", WalletCards],
  ["models", "Models", Layers3],
  ["settings", "Settings", Settings2],
];

const chartLabels = ["Oct 20", "Oct 22", "Oct 24", "Oct 26", "Oct 28", "Oct 30", "Nov 02"];

function buildAreaPath(data, width = 720, height = 220) {
  const max = Math.max(...data) * 1.15;
  const step = width / (data.length - 1);
  const points = data.map((value, index) => [index * step, height - (value / max) * height]);
  const line = points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return { line, area: `${line} L${width},${height} L0,${height} Z`, points };
}

function UsageChart() {
  const { t } = useI18n();
  const [tab, setTab] = useState("Spend");
  const valuesByTab = {
    Spend: usageData,
    Requests: usageData.map((value) => Math.round(value * 1.7)),
    Tokens: usageData.map((value) => Math.round(value * 2.3)),
  };
  const values = valuesByTab[tab];
  const { line, area } = useMemo(() => buildAreaPath(values), [values]);
  const max = Math.max(...values);

  return (
    <div className="dash-panel usage-panel">
      <div className="dash-panel__head">
        <div><strong>{t("Usage overview")}</strong><span>{t("Last 14 days")}</span></div>
        <div className="chart-tabs">
          {Object.keys(valuesByTab).map((item) => (
            <button key={item} className={tab === item ? "is-active" : ""} onClick={() => setTab(item)}>{t(item)}</button>
          ))}
        </div>
      </div>
      <div className="chart-stat">
        <strong>
          {tab === "Spend" ? "$48.62" : tab === "Requests" ? "18,492" : "3.84M"}
        </strong>
        <span className="positive"><ArrowUpRight size={14} /> 12.4%</span>
        <small>{t("vs previous 14 days")}</small>
      </div>
      <div className="usage-chart">
        <div className="chart-y">
          <span>{tab === "Spend" ? "$120" : tab === "Requests" ? "2K" : "400K"}</span>
          <span>{tab === "Spend" ? "$80" : tab === "Requests" ? "1.3K" : "267K"}</span>
          <span>{tab === "Spend" ? "$40" : tab === "Requests" ? "667" : "133K"}</span>
          <span>$0</span>
        </div>
        <div className="chart-canvas">
          <svg viewBox="0 0 720 220" preserveAspectRatio="none" aria-label={`${tab} chart`}>
            <defs>
              <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff6b35" stopOpacity=".25" />
                <stop offset="100%" stopColor="#ff6b35" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 73, 146, 220].map((y) => <line key={y} x1="0" x2="720" y1={y} y2={y} className="chart-gridline" />)}
            <path d={area} fill="url(#chartFill)" />
            <path d={line} className="chart-line" />
            <circle cx="720" cy={220 - (values[values.length - 1] / (max * 1.15)) * 220} r="5" className="chart-point" />
          </svg>
          <div className="chart-x">{chartLabels.map((label) => <span key={label}>{t(label)}</span>)}</div>
          <div className="chart-tooltip">
            <span>{t("NOV 2")}</span>
            <strong>{tab === "Spend" ? "$8.42" : tab === "Requests" ? "1,284" : "246K"}</strong>
            <small><ArrowUpRight size={12} /> 8.2%</small>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpendBreakdown() {
  const { t } = useI18n();
  return (
    <div className="dash-panel spend-breakdown">
      <div className="dash-panel__head">
        <div><strong>{t("Spend by model")}</strong><span>{t("Last 14 days")}</span></div>
        <button className="icon-button"><MoreHorizontal size={18} /></button>
      </div>
      <div className="spend-donut">
        <div className="donut" style={{ "--segments": "conic-gradient(#ff6b35 0 42%, #111827 42% 68%, #2868e8 68% 84%, #c8f169 84% 94%, #d8d4ca 94% 100%)" }}>
          <div><strong>$48.62</strong><span>{t("Total spend")}</span></div>
        </div>
      </div>
      <div className="spend-list">
        <div><i style={{ background: "#ff6b35" }} /><span>Claude Sonnet 4.5</span><strong>$20.42</strong><small>42%</small></div>
        <div><i style={{ background: "#111827" }} /><span>GPT-5</span><strong>$12.64</strong><small>26%</small></div>
        <div><i style={{ background: "#2868e8" }} /><span>Gemini 2.5 Pro</span><strong>$7.78</strong><small>16%</small></div>
        <div><i style={{ background: "#c8f169" }} /><span>DeepSeek R1</span><strong>$4.86</strong><small>10%</small></div>
        <div><i style={{ background: "#d8d4ca" }} /><span>{t("Other")}</span><strong>$2.92</strong><small>6%</small></div>
      </div>
    </div>
  );
}

const requests = [
  { id: "req_8f2k9", model: models[2], tokens: "3,284", cost: "$0.0182", latency: "1.12s", status: "200", time: "Just now" },
  { id: "req_7d1m4", model: models[0], tokens: "1,942", cost: "$0.0114", latency: "0.86s", status: "200", time: "12s ago" },
  { id: "req_2p6w8", model: models[4], tokens: "6,108", cost: "$0.0207", latency: "1.48s", status: "200", time: "31s ago" },
  { id: "req_9c3r1", model: models[8], tokens: "8,420", cost: "$0.0231", latency: "2.04s", status: "200", time: "1m ago" },
  { id: "req_4h7v2", model: models[5], tokens: "742", cost: "$0.0018", latency: "0.51s", status: "200", time: "2m ago" },
];

function RecentRequests() {
  const { t } = useI18n();
  return (
    <div className="dash-panel request-panel">
      <div className="dash-panel__head">
        <div><strong>{t("Recent requests")}</strong><span>{t("Live from all API keys")}</span></div>
        <button className="text-link">{t("View all")} <ArrowRight size={14} /></button>
      </div>
      <div className="request-table">
        <div className="request-row request-row--head">
          <span>{t("Request")}</span><span>{t("Model")}</span><span>{t("Tokens")}</span><span>{t("Cost")}</span><span>{t("Latency")}</span><span>{t("Status")}</span><span />
        </div>
        {requests.map((request) => (
          <div className="request-row" key={request.id}>
            <span className="request-id"><i className="request-dot" /><strong>{request.id}</strong><small>{t(request.time)}</small></span>
            <span className="request-model"><ModelMark model={request.model} size="xs" /> {request.model.name}</span>
            <span>{request.tokens}</span>
            <span>{request.cost}</span>
            <span>{request.latency}</span>
            <span><em className="status-code">{request.status}</em></span>
            <span><button className="icon-button"><ExternalLink size={14} /></button></span>
          </div>
        ))}
      </div>
    </div>
  );
}

function KeyModal({ onClose }) {
  const { t } = useI18n();
  const [name, setName] = useState(t("Production key"));
  const [limit, setLimit] = useState("25");

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="key-modal" role="dialog" aria-modal="true">
        <button className="modal-close" onClick={onClose}><X size={18} /></button>
        <span className="key-modal__icon"><KeyRound size={21} /></span>
        <h2>{t("Create API key")}</h2>
        <p>{t("Use a separate key for each application or environment.")}</p>
        <label className="field"><span>{t("Key name")}</span><input value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label className="field"><span>{t("Monthly limit")}</span><span className="input-prefix"><i>$</i><input type="number" value={limit} onChange={(event) => setLimit(event.target.value)} /></span></label>
        <div className="key-modal__options">
          <label><input type="checkbox" defaultChecked /><span>{t("Enable Auto Router")}</span></label>
          <label><input type="checkbox" defaultChecked /><span>{t("Allow all models")}</span></label>
        </div>
        <button className="button button--orange" onClick={onClose}>{t("Create key")} <ArrowRight size={16} /></button>
        <small>{t("Your key will be shown once. Store it securely.")}</small>
      </div>
    </div>
  );
}

export default function Dashboard({ onNavigate }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState("overview");
  const [keyModal, setKeyModal] = useState(false);
  const [keyVisible, setKeyVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const key = "sk-dy-v1-••••••••••••••••8f2k";
  const displayName = (user?.name || user?.email?.split("@")[0] || "Haochen").split(" ")[0];
  const displayEmail = user?.email || t("Personal workspace");
  const avatarInitial = displayName.charAt(0).toUpperCase();

  const copyKey = async () => {
    await navigator.clipboard?.writeText("sk-dy-v1-demo-7h4k2p9m8f2k");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="dashboard">
      <aside className="dashboard-sidebar">
        <button className="back-link" onClick={() => onNavigate("home")}><ArrowLeft size={15} /> {t("Back to site")}</button>
        <div className="workspace-switcher">
          <span className="workspace-avatar">D</span>
          <div><strong>DyToken</strong><span>{t("Personal workspace")}</span></div>
          <ChevronDown size={15} />
        </div>
        <nav className="dashboard-nav">
          {nav.map(([id, label, Icon]) => (
            <button key={id} className={activeNav === id ? "is-active" : ""} onClick={() => setActiveNav(id)}>
              <Icon size={17} /> {t(label)}
              {id === "keys" && <span>2</span>}
            </button>
          ))}
        </nav>
        <div className="dashboard-sidebar__foot">
          <div className="credit-card-mini">
            <div><span>{t("Credit balance")}</span><strong>$146.38</strong></div>
            <button onClick={() => onNavigate("pricing")}><Plus size={14} /> {t("Add credits")}</button>
          </div>
          <button><BookOpen size={16} /> {t("Documentation")} <ExternalLink size={13} /></button>
          <button><LifeBuoy size={16} /> {t("Support")}</button>
          <div className="sidebar-account">
            {user?.avatarUrl
              ? <img className="account-avatar" src={user.avatarUrl} alt="" />
              : <span className="account-avatar">{avatarInitial}</span>}
            <div><strong>{displayName}</strong><span>{displayEmail}</span></div>
            <MoreHorizontal size={16} />
          </div>
        </div>
      </aside>

      <section className="dashboard-main">
        <div className="dashboard-topbar">
          <div>
            <button className="mobile-back" onClick={() => onNavigate("home")}><ArrowLeft size={16} /></button>
            <span>{t("Console")}</span><b>/</b><strong>{t(nav.find((item) => item[0] === activeNav)?.[1])}</strong>
          </div>
          <div>
            <button className="icon-button" aria-label={t("Search")}><Search size={17} /></button>
            <button className="icon-button notification-button" aria-label={t("Notifications")}><Bell size={17} /><i /></button>
            <button className="button button--dark button--small" onClick={() => onNavigate("docs")}><Code2 size={14} /> {t("Quickstart")}</button>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="dashboard-heading">
            <div>
              <h1>{activeNav === "overview" ? t("Good afternoon, {name}", { name: displayName }) : t(nav.find((item) => item[0] === activeNav)?.[1])}</h1>
              <p>{activeNav === "overview" ? t("Here's what's happening across your workspace.") : t("Manage your workspace and API infrastructure.")}</p>
            </div>
            <div className="dashboard-heading__actions">
              <button className="button button--outline button--small"><Download size={15} /> {t("Export")}</button>
              {activeNav === "keys" ? (
                <button className="button button--orange button--small" onClick={() => setKeyModal(true)}><Plus size={15} /> {t("Create key")}</button>
              ) : (
                <button className="button button--orange button--small" onClick={() => setKeyModal(true)}><Plus size={15} /> {t("Create API key")}</button>
              )}
            </div>
          </div>

          {activeNav === "overview" && (
            <>
              <div className="stat-grid">
                <article>
                  <div className="stat-label"><span>{t("Spend")}</span><CircleDollarSign size={17} /></div>
                  <strong>$48.62</strong>
                  <div><span className="positive"><ArrowUpRight size={13} /> 12.4%</span><small>{t("vs previous period")}</small></div>
                </article>
                <article>
                  <div className="stat-label"><span>{t("Requests")}</span><Activity size={17} /></div>
                  <strong>18,492</strong>
                  <div><span className="positive"><ArrowUpRight size={13} /> 8.7%</span><small>{t("vs previous period")}</small></div>
                </article>
                <article>
                  <div className="stat-label"><span>{t("Tokens")}</span><SlidersHorizontal size={17} /></div>
                  <strong>3.84M</strong>
                  <div><span className="negative"><ArrowDownRight size={13} /> 2.1%</span><small>{t("vs previous period")}</small></div>
                </article>
                <article>
                  <div className="stat-label"><span>{t("Avg. latency")}</span><Gauge size={17} /></div>
                  <strong>842ms</strong>
                  <div><span className="positive"><ArrowDownRight size={13} /> 6.3%</span><small>{t("faster than period")}</small></div>
                </article>
              </div>

              <div className="dashboard-chart-grid">
                <UsageChart />
                <SpendBreakdown />
              </div>

              <div className="api-key-strip">
                <span className="api-key-strip__icon"><FileKey size={20} /></span>
                <div>
                  <strong>{t("Your first API key")}</strong>
                  <span>{t("Use this key to connect your app to every model.")}</span>
                </div>
                <code>{keyVisible ? "sk-dy-v1-demo-7h4k2p9m8f2k" : key}</code>
                <button className="icon-button" onClick={() => setKeyVisible((visible) => !visible)}>{keyVisible ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                <button className={`button button--small ${copied ? "button--success" : "button--outline"}`} onClick={copyKey}>{copied ? <Check size={14} /> : <Copy size={14} />} {copied ? t("Copied") : t("Copy")}</button>
                <button className="button button--dark button--small" onClick={() => onNavigate("docs")}>{t("View docs")}</button>
              </div>

              <div className="dashboard-lower-grid">
                <RecentRequests />
                <div className="dash-panel quickstart-panel">
                  <div className="dash-panel__head"><div><strong>{t("Quickstart")}</strong><span>{t("Make your first request")}</span></div></div>
                  <CodeBlock code={codeExamples.curl} language="bash" compact />
                  <button className="quickstart-link" onClick={() => onNavigate("docs")}>{t("Open full documentation")} <ArrowUpRight size={14} /></button>
                </div>
              </div>
            </>
          )}

          {activeNav === "keys" && (
            <div className="keys-page">
              <div className="dash-panel keys-panel">
                <div className="dash-panel__head"><div><strong>{t("API keys")}</strong><span>{t("2 active keys")}</span></div></div>
                <div className="key-list__head"><span>{t("Name")}</span><span>{t("Key")}</span><span>{t("Last used")}</span><span>{t("Spend")}</span><span>{t("Created")}</span><span /></div>
                <div className="key-list__row">
                  <span><KeyRound size={16} /><strong>{t("Production key")}</strong></span>
                  <code>sk-dy-v1-••••8f2k</code>
                  <span>{t("Just now")}</span>
                  <strong>$42.18</strong>
                  <span>{t("Oct 12, 2026")}</span>
                  <button className="icon-button"><MoreHorizontal size={17} /></button>
                </div>
                <div className="key-list__row">
                  <span><KeyRound size={16} /><strong>{t("Local development")}</strong></span>
                  <code>sk-dy-v1-••••3d9a</code>
                  <span>{t("2 hours ago")}</span>
                  <strong>$6.44</strong>
                  <span>{t("Oct 20, 2026")}</span>
                  <button className="icon-button"><MoreHorizontal size={17} /></button>
                </div>
              </div>
              <div className="key-security-note">
                <LockKeyhole size={20} />
                <div><strong>{t("Keep your keys secure")}</strong><p>{t("Never expose API keys in client-side code or public repositories.")}</p></div>
                <button onClick={() => onNavigate("docs")}>{t("Security guide")} <ArrowRight size={14} /></button>
              </div>
            </div>
          )}

          {!["overview", "keys"].includes(activeNav) && (
            <div className="dashboard-empty-panel">
              <span><Zap size={22} /></span>
              <h2>{t(nav.find((item) => item[0] === activeNav)?.[1])}</h2>
              <p>{t("This workspace section is ready for your production data.")}</p>
              <button className="button button--orange" onClick={() => setActiveNav("overview")}>{t("Back to overview")}</button>
            </div>
          )}
        </div>
      </section>
      {keyModal && <KeyModal onClose={() => setKeyModal(false)} />}
    </div>
  );
}
