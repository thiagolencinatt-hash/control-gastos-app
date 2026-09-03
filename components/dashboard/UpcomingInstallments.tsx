"use client";

import { CreditCard, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { format, isToday, isTomorrow, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";

interface UpcomingItem {
  description: string;
  amount: number;
  due_date: string;
  account_name: string;
}

interface UpcomingInstallmentsProps {
  installments: UpcomingItem[];
  monthlyTotal: number;
}

export function UpcomingInstallments({ installments, monthlyTotal }: UpcomingInstallmentsProps) {
  function getDueDateLabel(dateStr: string) {
    const date = new Date(dateStr + "T12:00:00");
    if (isToday(date)) return { label: "Hoy", urgent: true };
    if (isTomorrow(date)) return { label: "Mañana", urgent: true };
    const days = differenceInDays(date, new Date());
    if (days <= 3) return { label: `En ${days} días`, urgent: true };
    return { label: format(date, "d MMM", { locale: es }), urgent: false };
  }

  return (
    <div
      className="rounded-2xl p-4 h-full flex flex-col"
      style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold" style={{ color: "hsl(var(--foreground))" }}>
          Próximos vencimientos
        </h2>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
          style={{ background: "hsl(var(--warning-muted))" }}
        >
          <span className="text-xs font-bold" style={{ color: "hsl(var(--warning))" }}>
            {formatCurrency(monthlyTotal, "ARS", true)}/mes
          </span>
        </div>
      </div>

      {installments.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
          <CreditCard className="w-8 h-8 opacity-20 mb-2" style={{ color: "hsl(var(--muted-foreground))" }} />
          <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
            Sin vencimientos esta semana
          </p>
          <p className="text-xs opacity-70 mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
            ¡Todo en orden! 🎉
          </p>
        </div>
      ) : (
        <div className="flex-1 space-y-2">
          {installments.map((item, i) => {
            const { label, urgent } = getDueDateLabel(item.due_date);
            return (
              <div
                key={i}
                className="flex items-center gap-3 p-2.5 rounded-xl"
                style={{
                  background: urgent ? "hsl(var(--warning-muted))" : "hsl(var(--muted))",
                }}
              >
                {urgent ? (
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: "hsl(var(--warning))" }} />
                ) : (
                  <CreditCard className="w-4 h-4 flex-shrink-0" style={{ color: "hsl(var(--muted-foreground))" }} />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: "hsl(var(--foreground))" }}>
                    {item.description}
                  </p>
                  <p className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {item.account_name}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold" style={{ color: urgent ? "hsl(var(--warning))" : "hsl(var(--foreground))" }}>
                    {formatCurrency(item.amount, "ARS", true)}
                  </p>
                  <p className="text-[10px]" style={{ color: urgent ? "hsl(var(--warning))" : "hsl(var(--muted-foreground))" }}>
                    {label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
