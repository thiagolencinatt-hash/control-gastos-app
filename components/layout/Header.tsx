"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Bell } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
}

export function Header({ title, subtitle, actionButton }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6 h-16"
      style={{
        background: "hsl(var(--background) / 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid hsl(var(--border) / 0.5)",
      }}
    >
      <div>
        <h1 className="text-lg font-bold" style={{ color: "hsl(var(--foreground))" }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {actionButton}

        <button
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-muted/50 cursor-pointer"
          style={{ color: "hsl(var(--muted-foreground))" }}
          title="Notificaciones"
        >
          <Bell className="w-4 h-4" />
        </button>

        {mounted ? (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-muted/50 cursor-pointer"
            style={{ color: "hsl(var(--muted-foreground))" }}
            title="Cambiar tema"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4" />}
          </button>
        ) : (
          <div className="w-9 h-9" />
        )}
      </div>
    </header>
  );
}
