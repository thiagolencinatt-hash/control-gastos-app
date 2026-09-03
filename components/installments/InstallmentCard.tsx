"use client";

import { CreditCard, Calendar, CheckCircle2 } from "lucide-react";
import type { Installment } from "@/lib/types";
import { formatCurrency, formatPercent } from "@/lib/utils/currency";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface InstallmentCardProps {
  installment: Installment;
  onPay: () => void;
  onRefresh: () => void;
}

export function InstallmentCard({ installment: inst, onPay }: InstallmentCardProps) {
  const progress = inst.progress_percent || Math.round((inst.paid_installments / inst.total_installments) * 100);
  const remaining = inst.remaining_installments ?? (inst.total_installments - inst.paid_installments);

  return (
    <div
      className="rounded-2xl p-4 card-hover"
      style={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "hsl(var(--warning-muted))" }}
          >
            <CreditCard className="w-4.5 h-4.5" style={{ color: "hsl(var(--warning))" }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "hsl(var(--foreground))" }}>
              {inst.description}
            </p>
            <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
              {inst.account_name || inst.account?.name}
            </p>
          </div>
        </div>
        <span
          className="text-[10px] font-bold px-2 py-1 rounded-lg"
          style={{
            background: inst.has_interest ? "hsl(var(--expense-muted))" : "hsl(var(--income-muted))",
            color: inst.has_interest ? "hsl(var(--expense))" : "hsl(var(--income))",
          }}
        >
          {inst.has_interest ? `+${inst.cft_total.toFixed(1)}% CFT` : "Sin interés"}
        </span>
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-wide" style={{ color: "hsl(var(--muted-foreground))" }}>Por cuota</p>
          <p className="text-sm font-bold" style={{ color: "hsl(var(--foreground))" }}>
            {formatCurrency(inst.installment_amount, inst.currency, true)}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide" style={{ color: "hsl(var(--muted-foreground))" }}>Total</p>
          <p className="text-sm font-bold" style={{ color: "hsl(var(--foreground))" }}>
            {formatCurrency(inst.total_amount, inst.currency, true)}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide" style={{ color: "hsl(var(--muted-foreground))" }}>Restante</p>
          <p className="text-sm font-bold" style={{ color: "hsl(var(--expense))" }}>
            {formatCurrency((inst.remaining_amount ?? (remaining * inst.installment_amount)), inst.currency, true)}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
            {inst.paid_installments}/{inst.total_installments} cuotas pagadas
          </span>
          <span className="text-xs font-semibold" style={{ color: "hsl(var(--warning))" }}>
            {formatPercent(progress)}
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "hsl(var(--muted))" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: progress >= 80 ? "hsl(var(--income))" : "hsl(var(--warning))",
            }}
          />
        </div>
      </div>

      {/* Next due date + Pay button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" style={{ color: "hsl(var(--muted-foreground))" }} />
          <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
            Próx. vencimiento:{" "}
            {inst.next_due_date
              ? format(new Date(inst.next_due_date + "T12:00:00"), "d 'de' MMMM", { locale: es })
              : `día ${inst.due_day}`}
          </span>
        </div>
        <button
          onClick={onPay}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
          style={{
            background: "hsl(var(--income-muted))",
            color: "hsl(var(--income))",
          }}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Pagar cuota
        </button>
      </div>
    </div>
  );
}
