"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  if (theme === 'system') {
    return <button className="theme-toggle" aria-label="Toggle theme" style={{ visibility: 'hidden', width: '32px', height: '32px' }}></button>;
  }

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label="Toggle theme"
      style={{
        background: 'transparent',
        border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
        borderRadius: '50%',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'var(--text)',
        fontSize: '14px',
        transition: 'background 0.2s, transform 0.15s',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = 'color-mix(in srgb, var(--accent) 15%, transparent)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'scale(0.9)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {theme === 'light' ? '☀️' : '🌙'}
    </button>
  );
}
