"use client";

import { useState } from "react";
import { Briefcase, Plus, Settings2, Sparkles, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { SalaryModal } from "./SalaryModal";
import { TransactionForm } from "@/components/transactions/TransactionForm";

interface SalaryCardProps {
  salary?: number;
  payDay?: number;
  totalIncome30d?: number;
  onRefresh?: () => void;
}

export function SalaryCard({
  salary = 980000,
  payDay = 5,
  totalIncome30d = 980000,
  onRefresh,
}: SalaryCardProps) {
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [showExtraIncomeForm, setShowExtraIncomeForm] = useState(false);

  const extraIncome = Math.max(0, (totalIncome30d || 0) - (salary || 0));

  return (
    <>
      <div
        className="rounded-3xl p-5 lg:p-6 glass shadow-xl relative overflow-hidden"
        style={{ border: "1px solid hsl(var(--income) / 0.3)" }}
      >
        <div
          className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-15 blur-2xl pointer-events-none"
          style={{ background: "hsl(var(--income))" }}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Main Info */}
          <div className="flex items-start gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner"
              style={{ background: "hsl(var(--income) / 0.2)", color: "hsl(var(--income))" }}
            >
              <Briefcase className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-income">
                  Mi Sueldo Principal
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-income/15 text-income border border-income/30">
                  Día {payDay} de cada mes
                </span>
              </div>

              <div className="flex items-baseline gap-2 mt-0.5">
                <p className="text-2xl lg:text-3xl font-black text-foreground tracking-tight">
                  {formatCurrency(salary, "ARS", true)}
                </p>
                <span className="text-xs text-muted-foreground font-medium">/ mes</span>
              </div>

              {extraIncome > 0 && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" />
                  + {formatCurrency(extraIncome, "ARS", true)} de ingresos extras
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowExtraIncomeForm(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-income bg-income/10 hover:bg-income/20 border border-income/30 transition-all cursor-pointer"
              title="Sumar changa, freelance o ingreso extra"
            >
              <Plus className="w-4 h-4" />
              <span>+ Ingreso Extra</span>
            </button>

            <button
              onClick={() => setShowSalaryModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-black gradient-primary btn-3d cursor-pointer"
              title="Modificar monto de sueldo o día de cobro"
            >
              <Settings2 className="w-4 h-4 text-black" />
              <span>Configurar Sueldo</span>
            </button>
          </div>
        </div>
      </div>

      {showSalaryModal && (
        <SalaryModal
          isOpen={showSalaryModal}
          currentSalary={salary}
          currentPayDay={payDay}
          onClose={() => setShowSalaryModal(false)}
          onSuccess={() => {
            setShowSalaryModal(false);
            onRefresh?.();
          }}
        />
      )}

      {showExtraIncomeForm && (
        <TransactionForm
          isOpen={showExtraIncomeForm}
          defaultType="income"
          onClose={() => setShowExtraIncomeForm(false)}
          onSuccess={() => {
            setShowExtraIncomeForm(false);
            onRefresh?.();
          }}
        />
      )}
    </>
  );
}
