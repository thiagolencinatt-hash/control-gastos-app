"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowUpDown, CreditCard, Target, Bot } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Inicio" },
  { href: "/transactions", icon: ArrowUpDown, label: "Gastos" },
  { href: "/installments", icon: CreditCard, label: "Cuotas" },
  { href: "/goals", icon: Target, label: "Metas" },
  { href: "/ai-assistant", icon: Bot, label: "IA" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe"
      style={{
        background: "hsl(var(--card) / 0.95)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: "1px solid hsl(var(--border))",
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[56px]",
                isActive ? "text-white" : "text-muted-foreground"
              )}
              style={{
                background: isActive ? "hsl(var(--primary))" : "transparent",
                color: isActive ? "white" : "hsl(var(--muted-foreground))",
              }}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
