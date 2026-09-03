"use client";

import { useEffect, useState } from "react";
import { TrendingUp, RefreshCw, ArrowUpRight, DollarSign } from "lucide-react";

interface DollarRate {
  moneda: string;
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

export function DollarRates() {
  const [rates, setRates] = useState<DollarRate[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchRates() {
    setLoading(true);
    try {
      const res = await fetch("/api/rates");
      if (res.ok) {
        const data = await res.json();
        setRates(data.filter((r: DollarRate) => ["blue", "oficial", "bolsa", "cripto"].includes(r.casa)));
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRates();
  }, []);

  if (rates.length === 0 && !loading) return null;

  return (
    <div
      className="rounded-2xl p-4 transition-all"
      style={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center gradient-primary text-white">
            <DollarSign className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(var(--foreground))" }}>
            Cotizaciones Dólar (ARS)
          </span>
        </div>
        <button
          onClick={fetchRates}
          disabled={loading}
          title="Actualizar cotizaciones"
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {loading && rates.length === 0
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "hsl(var(--muted))" }} />
            ))
          : rates.map((rate) => {
              const isBlue = rate.casa === "blue";
              return (
                <div
                  key={rate.casa}
                  className="rounded-xl p-2.5 transition-all card-hover"
                  style={{
                    background: isBlue ? "hsl(var(--primary) / 0.1)" : "hsl(var(--muted) / 0.5)",
                    border: isBlue ? "1px solid hsl(var(--primary) / 0.25)" : "1px solid hsl(var(--border))",
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold truncate" style={{ color: isBlue ? "hsl(var(--primary))" : "hsl(var(--foreground))" }}>
                      {rate.nombre}
                    </span>
                    {isBlue && <span className="text-[9px] font-extrabold px-1 py-0.5 rounded gradient-primary text-white">HOT</span>}
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] block" style={{ color: "hsl(var(--muted-foreground))" }}>Venta</span>
                      <span className="text-sm font-bold" style={{ color: "hsl(var(--foreground))" }}>
                        ${rate.venta.toLocaleString("es-AR")}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] block" style={{ color: "hsl(var(--muted-foreground))" }}>Compra</span>
                      <span className="text-xs font-semibold" style={{ color: "hsl(var(--muted-foreground))" }}>
                        ${rate.compra.toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
