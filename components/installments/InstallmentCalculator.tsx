"use client";

import { useState } from "react";
import { Calculator, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";

export function InstallmentCalculator() {
  const [cashPrice, setCashPrice] = useState("100000");
  const [installmentsCount, setInstallmentsCount] = useState("6");
  const [installmentPrice, setInstallmentPrice] = useState("18000");
  const [cashDiscount, setCashDiscount] = useState("10");
  const [monthlyInflation, setMonthlyInflation] = useState("3.5");

  const cash = parseFloat(cashPrice) || 0;
  const count = parseInt(installmentsCount) || 1;
  const installment = parseFloat(installmentPrice) || 0;
  const discount = parseFloat(cashDiscount) || 0;
  const inflationRate = (parseFloat(monthlyInflation) || 0) / 100;

  // Valor al contado con descuento
  const finalCash = cash * (1 - discount / 100);

  // Valor presente descontado por inflación
  let presentValueInstallments = 0;
  for (let i = 1; i <= count; i++) {
    presentValueInstallments += installment / Math.pow(1 + inflationRate, i);
  }

  const totalInstallmentsNominal = installment * count;
  const difference = finalCash - presentValueInstallments;
  const isInstallmentsBetter = presentValueInstallments < finalCash;

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold" style={{ color: "hsl(var(--foreground))" }}>
            Calculadora: ¿Cuotas o Contado?
          </h2>
          <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
            Compara el valor real ajustado por inflación argentina
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>
            Precio de lista ($)
          </label>
          <input
            type="number"
            value={cashPrice}
            onChange={(e) => setCashPrice(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none"
            style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
          />
        </div>

        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>
            Descuento al contado (%)
          </label>
          <input
            type="number"
            value={cashDiscount}
            onChange={(e) => setCashDiscount(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none"
            style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
          />
        </div>

        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>
            Cantidad de cuotas
          </label>
          <select
            value={installmentsCount}
            onChange={(e) => setInstallmentsCount(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none"
            style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
          >
            {[1, 2, 3, 6, 9, 12, 18, 24].map((n) => (
              <option key={n} value={n}>{n} cuotas</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>
            Monto por cuota ($)
          </label>
          <input
            type="number"
            value={installmentPrice}
            onChange={(e) => setInstallmentPrice(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none"
            style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
          />
        </div>
      </div>

      {/* Resultado */}
      <div
        className="rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{
          background: isInstallmentsBetter ? "hsl(var(--income-muted))" : "hsl(var(--warning-muted))",
          border: `1px solid ${isInstallmentsBetter ? "hsl(var(--income) / 0.3)" : "hsl(var(--warning) / 0.3)"}`,
        }}
      >
        <div className="flex items-start gap-3">
          {isInstallmentsBetter ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "hsl(var(--income))" }} />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "hsl(var(--warning))" }} />
          )}
          <div>
            <p className="text-sm font-bold" style={{ color: isInstallmentsBetter ? "hsl(var(--income))" : "hsl(var(--warning))" }}>
              {isInstallmentsBetter ? "¡Te conviene pagar en Cuotas!" : "¡Te conviene pagar al Contado!"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "hsl(var(--foreground))" }}>
              {isInstallmentsBetter
                ? `Ahorrás aprox. ${formatCurrency(Math.abs(difference))} en valor presente ajustado por inflación.`
                : `Ahorrás aprox. ${formatCurrency(Math.abs(difference))} pagando de una vez con el descuento.`}
            </p>
          </div>
        </div>

        <div className="text-right text-xs space-y-0.5 flex-shrink-0" style={{ color: "hsl(var(--muted-foreground))" }}>
          <div>Contado final: <span className="font-bold text-foreground">{formatCurrency(finalCash)}</span></div>
          <div>Total cuotas nominal: <span className="font-bold text-foreground">{formatCurrency(totalInstallmentsNominal)}</span></div>
          <div>Costo real cuotas: <span className="font-bold text-foreground">{formatCurrency(presentValueInstallments)}</span></div>
        </div>
      </div>
    </div>
  );
}
