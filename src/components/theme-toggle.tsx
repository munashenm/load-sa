"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    const stored =
      localStorage.getItem("fluxmove-theme") ??
      localStorage.getItem("loadsa-theme");
    if (stored === "light") {
      setLight(true);
      document.documentElement.classList.add("theme-light");
    }
  }, []);

  function toggle() {
    const next = !light;
    setLight(next);
    if (next) {
      document.documentElement.classList.add("theme-light");
      localStorage.setItem("fluxmove-theme", "light");
    } else {
      document.documentElement.classList.remove("theme-light");
      localStorage.setItem("fluxmove-theme", "dark");
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-white"
      aria-label="Toggle theme"
    >
      {light ? "Dark" : "Light"} mode
    </button>
  );
}
