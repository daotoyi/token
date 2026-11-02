import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleDollarSign,
  Gauge,
  HelpCircle,
  Layers3,
  Minus,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { ModelMark, SectionLabel } from "../components";
import { models } from "../data";

const plans = [
  {
    name: "Pay as you go",
    description: "For prototypes and small projects.",
    price: "0",
    suffix: "",
    features: ["All 300+ models", "Pay per token", "Smart routing", "Usage analytics", "Community support"],
    cta: "Start for free",
  },
  {
    name: "Builder",
    description: "For teams shipping to production.",
    price: "29",
    suffix: "/mo",
    popular: true,
    features: ["Everything in Pay as you go", "5% routing discount", "5 team members", "Priority support", "Advanced analytics"],
    cta: "Start 14-day trial",
  },
  {
    name: "Scale",
    description: "For high-volume applications.",
    price: "Custom",
    suffix: "",
    features: ["Volume pricing", "Unlimited team members", "SSO and audit logs", "Dedicated support", "Custom rate limits"],
    cta: "Talk to sales",
  },
];

const faqs = [
  ["How does DyToken pricing work?", "You pay the model provider's listed token price with a small, transparent platform fee. There is no monthly minimum on the pay-as-you-go plan."],
  ["Do unused credits expire?", "Purchased credits remain available for 12 months. Promotional and trial credits may have a shorter expiry shown in your console."],
  ["Can I set spending limits?", "Yes. Set workspace, API key, and per-model limits. You can receive alerts before a limit is reached."],
  ["Do you charge for failed requests?", "No. Requests that fail before inference starts are not billed. Provider-specific billing rules apply after generation starts."],
];

export default function Pricing({ onNavigate }) {
  const [volume, setVolume] = useState(2);
  const [openFaq, setOpenFaq] = useState(0);
  const discountedPrice = useMemo(() => {
    const base = models[2].input * volume * 1000000 + models[2].output * volume * 250000;
    const discount = volume >= 10 ? 0.15 : volume >= 5 ? 0.08 : 0;
    return (base * (1 - discount)).toFixed(2);
  }, [volume]);

  return (
    <div className="pricing-page">
      <section className="pricing-hero">
        <div className="container">
          <SectionLabel>Simple, transparent pricing</SectionLabel>
          <h1>One bill for<br /><span>every model.</span></h1>
          <p>No monthly minimum. No hidden provider markups. Start free, then pay only for the tokens you use.</p>
          <div className="pricing-hero__badges">
            <span><Check size={14} /> $5 free credit</span>
            <span><Check size={14} /> No credit card required</span>
            <span><Check size={14} /> Cancel anytime</span>
          </div>
        </div>
      </section>

      <div className="container pricing-content">
        <div className="plan-grid">
          {plans.map((plan) => (
            <article className={`plan-card ${plan.popular ? "plan-card--popular" : ""}`} key={plan.name}>
              {plan.popular && <div className="plan-card__popular"><Sparkles size={13} /> MOST POPULAR</div>}
              <span className="plan-card__name">{plan.name}</span>
              <p>{plan.description}</p>
              <div className="plan-card__price">
                {plan.price !== "Custom" && <sup>$</sup>}
                <strong>{plan.price}</strong>
                {plan.suffix && <small>{plan.suffix}</small>}
              </div>
              <span className="plan-card__note">{plan.price === "Custom" ? "Annual contract" : "Plus model usage"}</span>
              <button className={`button ${plan.popular ? "button--orange" : "button--dark"}`} onClick={() => onNavigate("dashboard")}>
                {plan.cta} <ArrowRight size={16} />
              </button>
              <div className="plan-card__divider" />
              <strong className="plan-card__includes">What's included</strong>
              <ul>
                {plan.features.map((feature) => <li key={feature}><Check size={15} /> {feature}</li>)}
              </ul>
            </article>
          ))}
        </div>

        <section className="volume-calculator">
          <div className="volume-calculator__copy">
            <span className="calculator-icon"><Gauge size={20} /></span>
            <SectionLabel>Usage calculator</SectionLabel>
            <h2>Estimate your monthly spend.</h2>
            <p>Based on 75% input and 25% output tokens using Claude Sonnet 4.5. Your actual cost follows the models you use.</p>
            <div className="calculator-fields">
              <label>
                <span>Monthly token volume</span>
                <strong>{volume}M tokens</strong>
                <input type="range" min="1" max="20" value={volume} onChange={(event) => setVolume(Number(event.target.value))} />
                <small><span>1M</span><span>20M</span></small>
              </label>
              <div className="calculator-result">
                <span>Estimated monthly model usage</span>
                <strong>${discountedPrice}</strong>
                {volume >= 5 && <em><Zap size={13} /> {volume >= 10 ? "15%" : "8%"} volume discount applied</em>}
              </div>
            </div>
          </div>
          <div className="volume-calculator__aside">
            <div><ModelMark model={models[2]} size="md" /><span><strong>Claude Sonnet 4.5</strong><small>Anthropic</small></span></div>
            <div><span>Input / 1M</span><strong>${models[2].input.toFixed(2)}</strong></div>
            <div><span>Output / 1M</span><strong>${models[2].output.toFixed(2)}</strong></div>
            <div><span>Context</span><strong>{models[2].context}</strong></div>
            <button onClick={() => onNavigate("models")}>Compare models <ArrowRight size={14} /></button>
          </div>
        </section>

        <section className="price-principles">
          <div>
            <span className="feature-icon"><CircleDollarSign size={19} /></span>
            <h3>Provider price, no mystery markup</h3>
            <p>See the model's list price and the DyToken platform fee before a request is sent.</p>
          </div>
          <div>
            <span className="feature-icon feature-icon--blue"><ShieldCheck size={19} /></span>
            <h3>Hard spending limits</h3>
            <p>Set limits for each key, model, and workspace. Never get a surprise invoice.</p>
          </div>
          <div>
            <span className="feature-icon feature-icon--green"><Layers3 size={19} /></span>
            <h3>One consolidated invoice</h3>
            <p>Use every provider and receive one monthly bill with a complete usage breakdown.</p>
          </div>
        </section>

        <section className="pricing-table-section">
          <div className="section-heading split-heading">
            <div><SectionLabel>Model pricing</SectionLabel><h2>Popular model rates.</h2></div>
            <p>All prices are per 1M tokens. View the catalog for the complete list.</p>
          </div>
          <div className="pricing-model-table">
            <div className="pricing-model-table__head"><span>Model</span><span>Provider</span><span>Input</span><span>Output</span><span>Context</span><span /></div>
            {models.slice(0, 7).map((model) => (
              <div className="pricing-model-table__row" key={model.id}>
                <span><ModelMark model={model} size="xs" /><strong>{model.name}</strong></span>
                <span>{model.provider}</span>
                <strong>${model.input.toFixed(2)}</strong>
                <strong>${model.output.toFixed(2)}</strong>
                <span>{model.context}</span>
                <button onClick={() => onNavigate("playground")}>Try <ArrowRight size={13} /></button>
              </div>
            ))}
          </div>
          <button className="all-models-link" onClick={() => onNavigate("models")}>See all model pricing <ArrowRight size={15} /></button>
        </section>

        <section className="faq-section">
          <div className="faq-heading">
            <span className="faq-icon"><HelpCircle size={22} /></span>
            <SectionLabel>Questions</SectionLabel>
            <h2>Pricing FAQ</h2>
            <p>Everything you need to know about billing and plans.</p>
            <a href="mailto:hello@dyinvest.cn">Still have questions? <ArrowRight size={14} /></a>
          </div>
          <div className="faq-list">
            {faqs.map(([question, answer], index) => (
              <button key={question} className={openFaq === index ? "is-open" : ""} onClick={() => setOpenFaq(openFaq === index ? -1 : index)}>
                <span><strong>{question}</strong><em>{openFaq === index ? <Minus size={16} /> : <ChevronDown size={16} />}</em></span>
                {openFaq === index && <p>{answer}</p>}
              </button>
            ))}
          </div>
        </section>

        <section className="pricing-final-cta">
          <div><span className="final-cta__orb"><Sparkles size={22} /></span><h2>Start with $5 on us.</h2><p>Get your first request running in minutes.</p></div>
          <button className="button button--orange button--large" onClick={() => onNavigate("playground")}>Start building <ArrowRight size={17} /></button>
        </section>
      </div>
    </div>
  );
}
