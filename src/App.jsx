import { useCallback, useEffect, useState } from "react";
import { Header, Footer, LoginModal } from "./components";
import Home from "./pages/Home";
import Models from "./pages/Models";
import Playground from "./pages/Playground";
import Dashboard from "./pages/Dashboard";
import Docs from "./pages/Docs";
import Pricing from "./pages/Pricing";

const knownPages = new Set(["home", "models", "playground", "dashboard", "docs", "pricing"]);

function readRoute() {
  const route = window.location.hash.replace(/^#\/?/, "").split("?")[0];
  return knownPages.has(route) ? route : "home";
}

export default function App() {
  const [page, setPage] = useState(readRoute);
  const [loginOpen, setLoginOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("dytoken-theme") || "light");

  useEffect(() => {
    const onHashChange = () => {
      setPage(readRoute());
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("dytoken-theme", theme);
  }, [theme]);

  const navigate = useCallback((target) => {
    if (target === page) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    window.location.hash = `/${target}`;
  }, [page]);

  const toggleTheme = () => setTheme((current) => (current === "light" ? "dark" : "light"));

  const pages = {
    home: <Home onNavigate={navigate} onLogin={() => setLoginOpen(true)} />,
    models: <Models onNavigate={navigate} />,
    playground: <Playground onNavigate={navigate} onLogin={() => setLoginOpen(true)} />,
    dashboard: <Dashboard onNavigate={navigate} />,
    docs: <Docs onNavigate={navigate} />,
    pricing: <Pricing onNavigate={navigate} />,
  };

  return (
    <>
      <Header
        page={page}
        onNavigate={navigate}
        onLogin={() => setLoginOpen(true)}
        theme={theme}
        onTheme={toggleTheme}
      />
      <main>{pages[page]}</main>
      {!["playground", "dashboard"].includes(page) && (
        <Footer onNavigate={navigate} onLogin={() => setLoginOpen(true)} />
      )}
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
