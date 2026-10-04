"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function activeTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const sync = () => setTheme(activeTheme());
    const frame = window.requestAnimationFrame(sync);
    window.addEventListener("cedah-theme-change", sync);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("cedah-theme-change", sync);
    };
  }, []);

  function toggleTheme() {
    const next = activeTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    localStorage.setItem("cedah-theme", next);
    setTheme(next);
    window.dispatchEvent(new Event("cedah-theme-change"));
  }

  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      className={`theme-toggle ${compact ? "compact" : ""}`}
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} theme`}
      aria-pressed={theme === "dark"}
      title={`Switch to ${nextTheme} theme`}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="theme-sun">
          <circle cx="12" cy="12" r="3.5" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
        <svg viewBox="0 0 24 24" className="theme-moon">
          <path d="M20 15.2A8.2 8.2 0 0 1 8.8 4 8.4 8.4 0 1 0 20 15.2Z" />
        </svg>
        <i />
      </span>
      {!compact && (
        <span className="theme-toggle-label">
          {theme === "dark" ? "Dark" : "Light"}
        </span>
      )}
    </button>
  );
}
