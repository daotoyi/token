import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  CircleStop,
  Copy,
  FileText,
  KeyRound,
  MessageSquarePlus,
  Mic,
  PanelRightClose,
  Paperclip,
  RotateCcw,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  WandSparkles,
} from "lucide-react";
import { ModelMark } from "../components";
import { models } from "../data";
import { useI18n } from "../i18n";

const starters = [
  "Draft a product launch plan",
  "Refactor this React component",
  "Compare two pricing strategies",
];

function mockReply(prompt, model, language) {
  const cleanPrompt = prompt.trim();
  if (!cleanPrompt) return "";
  if (language === "zh") {
    return `下面是使用 ${model.name} 给出的一个可执行初稿。

1. 先明确结果
   定义这项工作必须产出的唯一结果，以及如何衡量成功。

2. 让第一版保持聚焦
   从最有价值的最小切片开始，快速验证，只有信号清晰后再扩展。

3. 为迭代而构建
   将假设集中管理，让决策过程可观察，并移除拖慢反馈循环的内容。

针对“${cleanPrompt.slice(0, 96)}${cleanPrompt.length > 96 ? "..." : ""}”，我会把它整理成一份简短的执行说明，包含负责人、里程碑、风险和明确的决策点。下一步我可以展开其中任意一部分。`;
  }
  return `Here's a practical first pass using ${model.name}.

1. Start with the outcome
   Define the one result this work needs to produce and how success will be measured.

2. Keep the first iteration narrow
   Focus on the highest-leverage slice, validate it quickly, then expand only after the signal is clear.

3. Build for iteration
   Put assumptions in one place, make decisions observable, and remove anything that slows down feedback.

For "${cleanPrompt.slice(0, 96)}${cleanPrompt.length > 96 ? "..." : ""}", I would turn this into a short execution brief with owners, milestones, risks, and a clear decision point. I can expand any of those sections next.`;
}

function ChatSidebar({ onNavigate, onClose }) {
  const { t } = useI18n();
  return (
    <aside className="chat-sidebar">
      <div className="chat-sidebar__top">
        <button className="back-link" onClick={() => onNavigate("home")}>
          <ArrowLeft size={15} /> {t("Back")}
        </button>
        <button className="icon-button" onClick={onClose} aria-label="Close sidebar">
          <PanelRightClose size={17} />
        </button>
      </div>
      <button className="new-chat-button">
        <MessageSquarePlus size={17} /> {t("New chat")} <span>⌘ K</span>
      </button>
      <div className="chat-sidebar__section">
        <span>{t("Today")}</span>
        <button className="is-active"><span>{t("Product launch strategy")}</span><Trash2 size={13} /></button>
        <button><span>{t("API migration notes")}</span><Trash2 size={13} /></button>
        <button><span>{t("Q4 pricing analysis")}</span><Trash2 size={13} /></button>
      </div>
      <div className="chat-sidebar__section">
        <span>{t("Previous 7 days")}</span>
        <button><span>{t("Homepage microcopy")}</span></button>
        <button><span>{t("SQL performance review")}</span></button>
        <button><span>{t("Customer interview summary")}</span></button>
      </div>
      <div className="chat-sidebar__bottom">
        <button onClick={() => onNavigate("dashboard")}><KeyRound size={15} /> {t("API keys")}</button>
        <div className="sidebar-usage">
          <div><span>{t("Free credit")}</span><strong>$4.82 / $5.00</strong></div>
          <div className="progress-track"><span style={{ width: "96.4%" }} /></div>
          <button onClick={() => onNavigate("pricing")}>{t("Add credits")} <ArrowRight size={13} /></button>
        </div>
        <div className="sidebar-account">
          <span className="account-avatar">WH</span>
          <div><strong>Wenhua</strong><span>{t("Personal workspace")}</span></div>
          <ChevronDown size={15} />
        </div>
      </div>
    </aside>
  );
}

function AssistantMessage({ content, model, onRegenerate }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard?.writeText(content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="chat-message chat-message--assistant">
      <div className="assistant-avatar"><Sparkles size={16} /></div>
      <div className="chat-message__content">
        <div className="message-meta">
          <span><strong>{model.name}</strong> {t("via DyToken")}</span>
          <span className="message-ok"><Check size={12} /> {t("Routed")}</span>
        </div>
        <div className="assistant-copy">
          {content.split("\n").map((line, index) => (
            <p key={`${line}-${index}`}>{line || <br />}</p>
          ))}
        </div>
        <div className="message-actions">
          <button onClick={copy}>{copied ? <Check size={14} /> : <Copy size={14} />} {copied ? t("Copied") : t("Copy")}</button>
          <button onClick={onRegenerate}><RotateCcw size={14} /> {t("Regenerate")}</button>
        </div>
      </div>
    </div>
  );
}

export default function Playground({ onNavigate, onLogin }) {
  const { language, t } = useI18n();
  const [selectedModelId, setSelectedModelId] = useState(
    () => sessionStorage.getItem("dytoken-playground-model") || "anthropic/claude-sonnet-4.5",
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [modelOpen, setModelOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "What are we building today? Give me a goal, a rough idea, or a piece of work to improve.",
      translationKey: "intro",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [systemPrompt, setSystemPrompt] = useState(t("You are a thoughtful product and engineering partner."));
  const [preview, setPreview] = useState(false);
  const timerRef = useRef(null);

  const selectedModel = models.find((model) => model.id === selectedModelId) || models[2];

  useEffect(() => {
    return () => window.clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    const englishPrompt = "You are a thoughtful product and engineering partner.";
    const chinesePrompt = "你是一位深思熟虑的产品与工程伙伴。";
    setSystemPrompt((current) => (
      current === englishPrompt || current === chinesePrompt
        ? t(englishPrompt)
        : current
    ));
  }, [language, t]);

  const submit = (event) => {
    event?.preventDefault();
    const prompt = input.trim();
    if (!prompt || loading) return;
    setMessages((current) => [...current, { role: "user", content: prompt }]);
    setInput("");
    setLoading(true);
    setPreview(true);
    timerRef.current = window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: mockReply(prompt, selectedModel, language) },
      ]);
      setLoading(false);
      setPreview(false);
    }, 1100);
  };

  const startWith = (starter) => {
    setInput(starter);
    document.querySelector(".composer textarea")?.focus();
  };

  const regenerate = () => {
    const lastUser = [...messages].reverse().find((message) => message.role === "user");
    if (!lastUser) return;
    setLoading(true);
    setPreview(true);
    timerRef.current = window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: mockReply(lastUser.content, selectedModel, language) },
      ]);
      setLoading(false);
      setPreview(false);
    }, 900);
  };

  return (
    <div className={`playground ${sidebarOpen ? "" : "sidebar-closed"} ${settingsOpen ? "" : "settings-closed"}`}>
      {sidebarOpen && <ChatSidebar onNavigate={onNavigate} onClose={() => setSidebarOpen(false)} />}
      <section className="chat-workspace">
        <div className="chat-topbar">
          <div className="chat-topbar__left">
            {!sidebarOpen && (
              <button className="icon-button" onClick={() => setSidebarOpen(true)} aria-label={t("Open sidebar")}>
                <MessageSquarePlus size={18} />
              </button>
            )}
            <div className="model-picker">
              <button className="model-picker__button" onClick={() => setModelOpen((open) => !open)}>
                <ModelMark model={selectedModel} size="sm" />
                <span><small>{t("MODEL")}</small><strong>{selectedModel.name}</strong></span>
                <ChevronDown size={15} />
              </button>
              {modelOpen && (
                <div className="model-picker__menu">
                  <div className="model-picker__search">{t("Select a model")}</div>
                  {models.slice(0, 7).map((model) => (
                    <button
                      key={model.id}
                      className={model.id === selectedModel.id ? "is-active" : ""}
                      onClick={() => {
                        setSelectedModelId(model.id);
                        setModelOpen(false);
                      }}
                    >
                      <ModelMark model={model} size="sm" />
                      <span><strong>{model.name}</strong><small>{model.provider} · {model.context} {t("Context")}</small></span>
                      {model.id === selectedModel.id && <Check size={15} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="preview-badge">{t("PREVIEW")}</span>
          </div>
          <div className="chat-topbar__right">
            <button className="text-button" onClick={onLogin}>{t("Share")}</button>
            <button className="button button--dark button--small" onClick={() => onNavigate("docs")}>
              {t("Get code")} <ArrowRight size={14} />
            </button>
            {!settingsOpen && (
              <button className="icon-button" onClick={() => setSettingsOpen(true)} aria-label={t("Open settings")}>
                <Settings2 size={17} />
              </button>
            )}
          </div>
        </div>

        <div className="chat-scroll">
          <div className="chat-content">
            <div className="chat-heading">
              <span className="chat-heading__icon"><WandSparkles size={20} /></span>
              <div>
                <h1>{t("New conversation")}</h1>
                <p>{t("{provider} model with {context} context", { provider: selectedModel.provider, context: selectedModel.context })}</p>
              </div>
            </div>
            <div className="messages">
              {messages.map((message, index) =>
                message.role === "assistant" ? (
                  <AssistantMessage
                    key={`${message.role}-${index}`}
                    content={message.translationKey ? t(message.content) : message.content}
                    model={selectedModel}
                    onRegenerate={regenerate}
                  />
                ) : (
                  <div className="chat-message chat-message--user" key={`${message.role}-${index}`}>
                    <div className="chat-message__content">
                      <div className="message-meta"><span>{t("You")}</span></div>
                      <p>{message.content}</p>
                    </div>
                    <span className="account-avatar account-avatar--small">WH</span>
                  </div>
                ),
              )}
              {loading && (
                <div className="chat-message chat-message--assistant">
                  <div className="assistant-avatar"><Sparkles size={16} /></div>
                  <div className="chat-message__content typing-state">
                    <span /><span /><span />
                    {preview && <em>{t("Routing request...")}</em>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="composer-wrap">
          <div className="chat-content">
            {messages.length === 1 && (
              <div className="starter-row">
                {starters.map((starter, index) => (
                  <button key={starter} onClick={() => startWith(t(starter))}>
                    {index === 0 ? <Sparkles size={14} /> : index === 1 ? <FileText size={14} /> : <SlidersHorizontal size={14} />}
                    {t(starter)}
                  </button>
                ))}
              </div>
            )}
            <form className="composer" onSubmit={submit}>
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    submit(event);
                  }
                }}
                placeholder={t("Message {model}...", { model: selectedModel.name })}
                rows={1}
              />
              <div className="composer__bottom">
                <div>
                  <button type="button" className="icon-button" aria-label={t("Add attachment")}><Paperclip size={17} /></button>
                  <button type="button" className="icon-button" aria-label={t("Use voice input")}><Mic size={17} /></button>
                </div>
                <div>
                  <span className="composer-hint">{t("Enter to send")}</span>
                  <button type="submit" className={`send-button ${loading ? "is-loading" : ""}`} disabled={!input.trim() || loading}>
                    {loading ? <CircleStop size={17} /> : <ArrowRight size={17} />}
                  </button>
                </div>
              </div>
            </form>
            <p className="composer-note">{t("Preview responses are generated by the interface and are not billed.")}</p>
          </div>
        </div>
      </section>

      {settingsOpen && (
        <aside className="chat-settings">
          <div className="chat-settings__head">
            <strong>{t("Parameters")}</strong>
            <button className="icon-button" onClick={() => setSettingsOpen(false)} aria-label={t("Close settings")}><PanelRightClose size={16} /></button>
          </div>
          <div className="settings-model">
            <span className="settings-model__mark"><ModelMark model={selectedModel} size="md" /></span>
            <div><strong>{selectedModel.name}</strong><span>{selectedModel.provider}</span></div>
            <span className="availability"><i /> {t("Live")}</span>
          </div>
          <div className="settings-grid">
            <div><span>{t("Context")}</span><strong>{selectedModel.context}</strong></div>
            <div><span>{t("Max output")}</span><strong>64K</strong></div>
            <div><span>{t("Input")}</span><strong>${selectedModel.input.toFixed(2)}</strong></div>
            <div><span>{t("Output")}</span><strong>${selectedModel.output.toFixed(2)}</strong></div>
          </div>
          <label className="range-field">
            <span><strong>{t("Temperature")}</strong><output>{temperature.toFixed(1)}</output></span>
            <input type="range" min="0" max="2" step="0.1" value={temperature} onChange={(event) => setTemperature(Number(event.target.value))} />
            <small><span>{t("Precise")}</span><span>{t("Creative")}</span></small>
          </label>
          <label className="range-field">
            <span><strong>{t("Max tokens")}</strong><output>{maxTokens}</output></span>
            <input type="range" min="256" max="8192" step="256" value={maxTokens} onChange={(event) => setMaxTokens(Number(event.target.value))} />
            <small><span>256</span><span>8K</span></small>
          </label>
          <label className="field">
            <span>{t("System prompt")}</span>
            <textarea rows={4} value={systemPrompt} onChange={(event) => setSystemPrompt(event.target.value)} />
          </label>
          <div className="settings-cost">
            <span>{t("Estimated cost")}</span>
            <strong>$0.0094</strong>
            <small>{t("for 2,400 input + 850 output tokens")}</small>
          </div>
          <div className="settings-actions">
            <button onClick={() => { setTemperature(0.7); setMaxTokens(4096); }}>
              <RotateCcw size={14} /> {t("Reset")}
            </button>
            <button onClick={() => setSettingsOpen(false)}>{t("Done")}</button>
          </div>
        </aside>
      )}
    </div>
  );
}
