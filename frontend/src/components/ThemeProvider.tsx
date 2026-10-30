"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    try {
      const stored = (localStorage.getItem("ayursetu_theme") || localStorage.getItem("ayursetu-theme")) as Theme | null;
      return stored === "dark" || stored === "light" ? stored : "light";
    } catch {
      return "light";
    }
  });
  const [mounted, setMounted] = useState(false);

  const applyTheme = (t: Theme) => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    if (t === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
      root.setAttribute("data-theme", "dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      root.setAttribute("data-theme", "light");
      root.style.colorScheme = "light";
    }
  };

  useEffect(() => {
    applyTheme(theme);
    setMounted(true);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("ayursetu_theme", newTheme);
        localStorage.setItem("ayursetu-theme", newTheme);
      } catch {
        // Handle localStorage restrictions
      }
      applyTheme(newTheme);
    }
  };

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme: mounted ? theme : "light", toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
