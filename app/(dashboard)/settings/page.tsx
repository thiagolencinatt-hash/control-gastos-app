"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { useTheme } from "next-themes";
import {
  Settings,
  Database,
  Moon,
  Sun,
  Laptop,
  Download,
  CheckCircle2,
  AlertCircle,
  Tag,
  Plus,
  Trash2,
  Sparkles,
} from "lucide-react";
import type { Category } from "@/lib/types";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState<"expense" | "income">("expense");
  const [newCatColor, setNewCatColor] = useState("#6366F1");
  const [exported, setExported] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setCategories(d);
      })
      .catch(() => {});
  }, []);

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat: Category = {
      id: crypto.randomUUID(),
      user_id: "demo-user",
      name: newCatName,
      type: newCatType,
      icon: "Tag",
      color: newCatColor,
      is_default: false,
      created_at: new Date().toISOString(),
    };

    setCategories((prev) => [...prev, newCat]);
    setNewCatName("");
  }

  async function handleExportData() {
    try {
      const [txRes, accRes, instRes, goalsRes] = await Promise.all([
        fetch("/api/transactions?limit=1000"),
        fetch("/api/accounts"),
        fetch("/api/installments"),
        fetch("/api/goals"),
      ]);

      const data = {
        exportedAt: new Date().toISOString(),
        transactions: (await txRes.json()).data || [],
        accounts: await accRes.json(),
        installments: await instRes.json(),
        goals: await goalsRes.json(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `finance_ai_backup_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    } catch {
      alert("Error al exportar los datos");
    }
  }

  return (
    <div className="flex flex-col">
      <Header title="Configuración" subtitle="Preferencias, categorías y datos del sistema" />

      <div className="flex-1 p-4 lg:p-6 max-w-4xl space-y-6">
        {/* Apariencia / Tema */}
        <section
          className="rounded-2xl p-6"
          style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                Apariencia y Tema
              </h2>
              <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                Personalizá la interfaz visual de FinanceAI
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "dark", label: "Oscuro (Recomendado)", icon: Moon },
              { id: "light", label: "Claro", icon: Sun },
              { id: "system", label: "Sistema", icon: Laptop },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className="flex flex-col items-center justify-center p-4 rounded-xl transition-all card-hover"
                style={{
                  background: theme === t.id ? "hsl(var(--primary) / 0.15)" : "hsl(var(--muted))",
                  border: theme === t.id ? "2px solid hsl(var(--primary))" : "1px solid hsl(var(--border))",
                  color: theme === t.id ? "hsl(var(--primary))" : "hsl(var(--foreground))",
                }}
              >
                <t.icon className="w-5 h-5 mb-2" />
                <span className="text-xs font-semibold">{t.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Categorías */}
        <section
          className="rounded-2xl p-6"
          style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                Categorías de Gastos e Ingresos
              </h2>
              <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                Organiza tus transacciones por rubro
              </p>
            </div>
          </div>

          <form onSubmit={handleAddCategory} className="flex flex-wrap gap-2 mb-4">
            <input
              type="text"
              placeholder="Nueva categoría (ej. Mascotas, Cursos...)"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 min-w-[200px] px-3 py-2 rounded-xl text-sm outline-none"
              style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
            />
            <select
              value={newCatType}
              onChange={(e) => setNewCatType(e.target.value as "expense" | "income")}
              className="px-3 py-2 rounded-xl text-sm outline-none"
              style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
            >
              <option value="expense">Gasto</option>
              <option value="income">Ingreso</option>
            </select>
            <input
              type="color"
              value={newCatColor}
              onChange={(e) => setNewCatColor(e.target.value)}
              className="w-10 h-10 rounded-xl cursor-pointer p-1"
              style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))" }}
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white gradient-primary flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Agregar
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span
                key={cat.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                style={{
                  background: `${cat.color || "#6366F1"}18`,
                  color: cat.color || "#6366F1",
                  border: `1px solid ${cat.color || "#6366F1"}30`,
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: cat.color || "#6366F1" }} />
                {cat.name} ({cat.type === "income" ? "Ingreso" : "Gasto"})
              </span>
            ))}
          </div>
        </section>

        {/* Exportación y Backup */}
        <section
          className="rounded-2xl p-6"
          style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                Copia de Seguridad y Exportación
              </h2>
              <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                Descargá todos tus datos en formato JSON compatible
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: "hsl(var(--muted))" }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                Exportar base de datos completa
              </p>
              <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                Incluye transacciones, cuentas, cuotas y metas
              </p>
            </div>
            <button
              onClick={handleExportData}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white gradient-primary flex items-center gap-2 shadow-sm"
            >
              {exported ? <CheckCircle2 className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              {exported ? "¡Descargado!" : "Exportar JSON"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
