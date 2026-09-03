"use client";

import { useMemo } from "react";
import type { Installment } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/currency";
import { addMonths, format, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface FutureProjectionProps {
  installments: Installment[];
}

export function FutureProjection({ installments }: FutureProjectionProps) {
  const projectionMonths = 6;

  const projection = useMemo(() => {
    const today = startOfMonth(new Date());
    return Array.from({ length: projectionMonths }, (_, i) => {
      const month = addMonths(today, i);
      const monthKey = format(month, "yyyy-MM");

      // Calcular cuánto se paga en este mes
      let totalForMonth = 0;
      const activeItems: Array<{ description: string; amount: number; has_interest: boolean }> = [];

      installments.forEach((inst) => {
        const startDate = new Date(inst.start_date);
        const monthIndex = i; // mes desde hoy
        const installmentMonthIndex =
          (month.getFullYear() - startDate.getFullYear()) * 12 +
          (month.getMonth() - startDate.getMonth());

        const isActiveThisMonth =
          installmentMonthIndex >= 0 &&
          installmentMonthIndex < inst.total_installments &&
          installmentMonthIndex >= inst.paid_installments;

        if (isActiveThisMonth) {
          totalForMonth += inst.installment_amount;
          activeItems.push({
            description: inst.description,
            amount: inst.installment_amount,
            has_interest: inst.has_interest,
          });
        }
      });

      return {
        month: format(month, "MMM yy", { locale: es }),
        monthFull: format(month, "MMMM yyyy", { locale: es }),
        total: totalForMonth,
        items: activeItems,
        isCurrentMonth: i === 0,
      };
    });
  }, [installments]);

  const maxTotal = Math.max(...projection.map((p) => p.total), 1);

  return (
    <div className="space-y-6">
      {/* Bar chart */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
      >
        <h3 className="text-sm font-semibold mb-4" style={{ color: "hsl(var(--foreground))" }}>
          Compromisos mensuales — próximos {projectionMonths} meses
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projection} barSize={32}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="glass-strong rounded-xl p-3 text-sm shadow-xl">
                        <p className="font-semibold capitalize" style={{ color: "hsl(var(--foreground))" }}>{d.monthFull}</p>
                        <p className="text-lg font-bold" style={{ color: "hsl(var(--primary))" }}>{formatCurrency(d.total)}</p>
                        <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{d.items.length} cuotas</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {projection.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.isCurrentMonth ? "hsl(var(--primary))" : entry.total > maxTotal * 0.8 ? "hsl(var(--expense))" : "hsl(var(--primary) / 0.4)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Month detail cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projection.map((month) => (
          <div
            key={month.month}
            className="rounded-2xl p-4"
            style={{
              background: month.isCurrentMonth ? "hsl(var(--primary) / 0.1)" : "hsl(var(--card))",
              border: `1px solid ${month.isCurrentMonth ? "hsl(var(--primary) / 0.3)" : "hsl(var(--border))"}`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold capitalize" style={{ color: "hsl(var(--foreground))" }}>{month.monthFull}</p>
              <span className="text-sm font-bold" style={{ color: month.isCurrentMonth ? "hsl(var(--primary))" : "hsl(var(--expense))" }}>
                {formatCurrency(month.total, "ARS", true)}
              </span>
            </div>
            {month.items.length === 0 ? (
              <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Sin compromisos 🎉</p>
            ) : (
              <div className="space-y-1.5">
                {month.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.has_interest ? "hsl(var(--expense))" : "hsl(var(--income))" }} />
                      <span className="text-xs truncate max-w-28" style={{ color: "hsl(var(--foreground))" }}>{item.description}</span>
                    </div>
                    <span className="text-xs font-medium flex-shrink-0" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {formatCurrency(item.amount, "ARS", true)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
