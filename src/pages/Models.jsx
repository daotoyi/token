import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ExternalLink,
  Filter,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
} from "lucide-react";
import { ModelMark, SectionLabel, SelectField } from "../components";
import { models, providers } from "../data";

const categories = ["All", "Flagship", "Fast", "Reasoning", "Coding", "Open source", "Multimodal"];

export default function Models({ onNavigate }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [provider, setProvider] = useState("All providers");
  const [sort, setSort] = useState("Recommended");
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("dytoken-favorites") || "[]");
    } catch {
      return [];
    }
  });
  const [mobileFilters, setMobileFilters] = useState(false);

  const filtered = useMemo(() => {
    let rows = models.filter((model) => {
      const matchesSearch =
        model.name.toLowerCase().includes(search.toLowerCase()) ||
        model.id.toLowerCase().includes(search.toLowerCase()) ||
        model.provider.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "All" || model.category === category;
      const matchesProvider = provider === "All providers" || model.provider === provider;
      return matchesSearch && matchesCategory && matchesProvider;
    });

    if (sort === "Lowest input price") rows = [...rows].sort((a, b) => a.input - b.input);
    if (sort === "Lowest latency") rows = [...rows].sort((a, b) => a.latency - b.latency);
    if (sort === "Largest context") rows = [...rows].sort((a, b) => parseInt(b.context) - parseInt(a.context));
    if (sort === "Name") rows = [...rows].sort((a, b) => a.name.localeCompare(b.name));
    return rows;
  }, [category, provider, search, sort]);

  const toggleFavorite = (id) => {
    setFavorites((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      localStorage.setItem("dytoken-favorites", JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="catalog-page">
      <section className="catalog-hero">
        <div className="container">
          <div className="catalog-hero__copy">
            <SectionLabel>Model catalog</SectionLabel>
            <h1>Find your next<br /><span>favorite model.</span></h1>
            <p>Compare pricing, context, latency, and capabilities across every provider.</p>
          </div>
          <div className="catalog-hero__stats">
            <div><strong>300+</strong><span>Models</span></div>
            <div><strong>62</strong><span>Providers</span></div>
            <div><strong>18</strong><span>Edge regions</span></div>
          </div>
        </div>
      </section>

      <div className="container catalog-toolbar">
        <div className="catalog-search">
          <Search size={18} />
          <input
            type="search"
            placeholder="Search models or providers..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search models"
          />
          <kbd>⌘ K</kbd>
        </div>
        <button className="button button--outline mobile-filter-button" onClick={() => setMobileFilters((open) => !open)}>
          <Filter size={16} /> Filters
        </button>
        <button className="button button--dark" onClick={() => onNavigate("playground")}>
          Compare in chat <ArrowRight size={16} />
        </button>
      </div>

      <div className="container catalog-layout">
        <aside className={`catalog-filters ${mobileFilters ? "is-open" : ""}`}>
          <div className="filter-heading">
            <span><SlidersHorizontal size={17} /> Filters</span>
            <button
              onClick={() => {
                setCategory("All");
                setProvider("All providers");
                setSearch("");
              }}
            >
              Reset
            </button>
          </div>
          <div className="filter-group">
            <strong>Use case</strong>
            {categories.map((item) => (
              <button
                key={item}
                className={category === item ? "is-active" : ""}
                onClick={() => setCategory(item)}
              >
                <span>{item}</span>
                <span className="filter-count">
                  {item === "All" ? models.length : models.filter((model) => model.category === item).length}
                </span>
              </button>
            ))}
          </div>
          <div className="filter-group">
            <strong>Provider</strong>
            <button className={provider === "All providers" ? "is-active" : ""} onClick={() => setProvider("All providers")}>
              <span>All providers</span><span className="filter-count">{models.length}</span>
            </button>
            {Object.keys(providers).map((item) => (
              <button key={item} className={provider === item ? "is-active" : ""} onClick={() => setProvider(item)}>
                <span>{item}</span>
                <span className="filter-count">{models.filter((model) => model.provider === item).length}</span>
              </button>
            ))}
          </div>
          <div className="filter-promo">
            <Sparkles size={18} />
            <strong>Not sure where to start?</strong>
            <p>Let Auto Router pick the best model for every request.</p>
            <button onClick={() => onNavigate("playground")}>Try Auto Router <ArrowRight size={14} /></button>
          </div>
        </aside>

        <section className="catalog-results">
          <div className="catalog-results__top">
            <div>
              <strong>{filtered.length} models</strong>
              <span>{category === "All" ? "Across all providers" : `${category} models`}</span>
            </div>
            <SelectField value={sort} onChange={(event) => setSort(event.target.value)} label="">
              <option>Recommended</option>
              <option>Lowest input price</option>
              <option>Lowest latency</option>
              <option>Largest context</option>
              <option>Name</option>
            </SelectField>
          </div>
          <div className="model-table">
            <div className="model-table__head">
              <span>Model</span>
              <span>Context</span>
              <span>Input / 1M</span>
              <span>Output / 1M</span>
              <span>Latency</span>
              <span>Tokens/s</span>
              <span />
            </div>
            {filtered.map((model) => (
              <div className="model-table__row" key={model.id}>
                <div className="model-table__model">
                  <ModelMark model={model} />
                  <div>
                    <strong>{model.name}</strong>
                    <span>{model.provider} <i /> {model.id}</span>
                  </div>
                  {model.badge && <em>{model.badge}</em>}
                </div>
                <div data-label="Context"><strong>{model.context}</strong></div>
                <div data-label="Input"><strong>${model.input.toFixed(2)}</strong></div>
                <div data-label="Output"><strong>${model.output.toFixed(2)}</strong></div>
                <div data-label="Latency"><span className="availability"><i /> {model.latency}s</span></div>
                <div data-label="Throughput"><strong>{model.throughput}</strong></div>
                <div className="model-table__actions">
                  <button
                    className={`favorite-button ${favorites.includes(model.id) ? "is-active" : ""}`}
                    onClick={() => toggleFavorite(model.id)}
                    aria-label={favorites.includes(model.id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Star size={17} fill={favorites.includes(model.id) ? "currentColor" : "none"} />
                  </button>
                  <button
                    className="row-chat-button"
                    onClick={() => {
                      sessionStorage.setItem("dytoken-playground-model", model.id);
                      onNavigate("playground");
                    }}
                  >
                    Chat <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            ))}
            {!filtered.length && (
              <div className="empty-state">
                <Search size={22} />
                <strong>No models found</strong>
                <p>Try a different search or reset your filters.</p>
                <button onClick={() => { setSearch(""); setCategory("All"); setProvider("All providers"); }}>
                  Clear filters
                </button>
              </div>
            )}
          </div>
          <div className="catalog-footnote">
            <Check size={15} /> Pricing shown per 1M tokens. All models share the same API key and billing account.
            <button onClick={() => onNavigate("pricing")}>View billing details <ChevronDown size={14} /></button>
          </div>
        </section>
      </div>
    </div>
  );
}
