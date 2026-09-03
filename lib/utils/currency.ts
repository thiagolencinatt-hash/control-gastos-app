/**
 * Formatea un número como moneda argentina (ARS)
 */
export function formatCurrency(
  amount: number,
  currency: string = "ARS",
  compact: boolean = false
): string {
  if (compact && Math.abs(amount) >= 1000000) {
    return `${currency === "ARS" ? "$" : currency + " "}${(amount / 1000000).toFixed(1)}M`;
  }
  if (compact && Math.abs(amount) >= 1000) {
    return `${currency === "ARS" ? "$" : currency + " "}${(amount / 1000).toFixed(1)}K`;
  }

  const localeMap: Record<string, string> = {
    ARS: "es-AR",
    USD: "en-US",
    EUR: "es-ES",
    BTC: "en-US",
    USDT: "en-US",
  };

  const locale = localeMap[currency] || "es-AR";

  if (currency === "BTC") {
    return `₿ ${amount.toFixed(8)}`;
  }
  if (currency === "USDT" || currency === "USDC") {
    return `${currency} ${amount.toFixed(2)}`;
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency === "USDT" || currency === "USDC" ? "USD" : currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formatea un porcentaje
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Calcula el CFT (Costo Financiero Total) de una cuota
 */
export function calculateCFT(
  totalAmount: number,
  installmentAmount: number,
  totalInstallments: number
): number {
  const totalPaid = installmentAmount * totalInstallments;
  if (totalAmount === 0) return 0;
  return ((totalPaid / totalAmount) - 1) * 100;
}

/**
 * Calcula cuántos meses se necesitan para alcanzar un objetivo
 */
export function monthsToGoal(
  targetAmount: number,
  currentAmount: number,
  monthlyContribution: number
): number | null {
  const remaining = targetAmount - currentAmount;
  if (remaining <= 0) return 0;
  if (!monthlyContribution || monthlyContribution <= 0) return null;
  return Math.ceil(remaining / monthlyContribution);
}

/**
 * Convierte meses a texto legible
 */
export function monthsToText(months: number | null): string {
  if (months === null) return "Sin fecha estimada";
  if (months === 0) return "¡Meta alcanzada!";
  if (months === 1) return "1 mes";
  if (months < 12) return `${months} meses`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) return `${years} ${years === 1 ? "año" : "años"}`;
  return `${years} ${years === 1 ? "año" : "años"} y ${remainingMonths} ${remainingMonths === 1 ? "mes" : "meses"}`;
}
