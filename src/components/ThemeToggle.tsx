"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function activeTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#071925" : "#f8fbfa");
  window.dispatchEvent(new Event("cedah-theme-change"));
}

function savedTheme(): Theme | null {
  try {
    const saved = window.localStorage.getItem("cedah-theme");
    return saved === "dark" || saved === "light" ? saved : null;
  } catch {
    return null;
  }
}

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const sync = () => setTheme(activeTheme());
    const preference = window.matchMedia("(prefers-color-scheme: dark)");
    const syncPreference = () => {
      if (!savedTheme()) applyTheme(preference.matches ? "dark" : "light");
    };
    const syncStorage = (event: StorageEvent) => {
      if (event.key === "cedah-theme" || event.key === null) {
        applyTheme(savedTheme() || (preference.matches ? "dark" : "light"));
      }
    };
    const frame = window.requestAnimationFrame(sync);
    window.addEventListener("cedah-theme-change", sync);
    window.addEventListener("storage", syncStorage);
    preference.addEventListener("change", syncPreference);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("cedah-theme-change", sync);
      window.removeEventListener("storage", syncStorage);
      preference.removeEventListener("change", syncPreference);
    };
  }, []);

  function toggleTheme() {
    const next = activeTheme() === "dark" ? "light" : "dark";
    try {
      window.localStorage.setItem("cedah-theme", next);
    } catch {
      // The control also works in browsers where storage is disabled.
    }
    applyTheme(next);
    setTheme(next);
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
      <svg viewBox="0 0 24 24" className="theme-toggle-icon" aria-hidden="true">
        {theme === "dark" ? (
          <>
            <circle cx="12" cy="12" r="3.5" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : (
          <path d="M20 15.2A8.2 8.2 0 0 1 8.8 4 8.4 8.4 0 1 0 20 15.2Z" />
        )}
      </svg>
      {!compact && (
        <span className="theme-toggle-label">
          {theme === "dark" ? "Dark" : "Light"}
        </span>
      )}
    </button>
  );
}
