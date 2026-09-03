"use client";

import { useEffect, useState } from "react";
import type { Account } from "@/lib/types";

interface Filters {
  type: string;
  from: string;
  to: string;
  account_id: string;
}

interface TransactionFiltersProps {
  filters: Filters;
  onChange: (f: Filters) => void;
}

export function TransactionFilters({ filters, onChange }: TransactionFiltersProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    fetch("/api/accounts").then((r) => r.json()).then(setAccounts).catch(() => {});
  }, []);

  const set = (k: keyof Filters, v: string) => onChange({ ...filters, [k]: v });

  return (
    <div
      className="rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3"
      style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
    >
      <div>
        <label className="text-xs font-medium block mb-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>Tipo</label>
        <select
          value={filters.type} onChange={(e) => set("type", e.target.value)}
          className="w-full px-2.5 py-2 rounded-lg text-sm outline-none"
          style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
        >
          <option value="">Todos</option>
          <option value="income">Ingresos</option>
          <option value="expense">Gastos</option>
          <option value="transfer">Transferencias</option>
        </select>
      </div>

      <div>
        <label className="text-xs font-medium block mb-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>Cuenta</label>
        <select
          value={filters.account_id} onChange={(e) => set("account_id", e.target.value)}
          className="w-full px-2.5 py-2 rounded-lg text-sm outline-none"
          style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
        >
          <option value="">Todas</option>
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium block mb-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>Desde</label>
        <input
          type="date" value={filters.from} onChange={(e) => set("from", e.target.value)}
          className="w-full px-2.5 py-2 rounded-lg text-sm outline-none"
          style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
        />
      </div>

      <div>
        <label className="text-xs font-medium block mb-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>Hasta</label>
        <input
          type="date" value={filters.to} onChange={(e) => set("to", e.target.value)}
          className="w-full px-2.5 py-2 rounded-lg text-sm outline-none"
          style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
        />
      </div>
    </div>
  );
}
