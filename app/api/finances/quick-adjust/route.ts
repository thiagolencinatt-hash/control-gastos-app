import { NextRequest, NextResponse } from "next/server";
import {
  resetToCleanAccount,
  setDirectFinances,
  setSalaryConfig,
  setExactCashInHand,
  clearAllExpenses,
  getDemoSummary,
} from "@/lib/demo-data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action,
      totalBalance,
      monthlyIncome,
      monthlyExpense,
      accountName,
      clearExpenses,
      salaryAmount,
      payDay,
      alsoUpdateBalance,
      accountId,
    } = body;

    if (action === "set_salary") {
      const summary = setSalaryConfig({
        amount: parseFloat(salaryAmount) || 0,
        payDay: parseInt(payDay) || 5,
        alsoUpdateCurrentBalance: Boolean(alsoUpdateBalance),
        accountId,
      });
      return NextResponse.json({ success: true, summary });
    }

    if (action === "set_cash") {
      const summary = setExactCashInHand({
        totalAmount: parseFloat(totalBalance) || 0,
        accountName,
        clearExpenses: Boolean(clearExpenses),
        setSalaryAmount: monthlyIncome ? parseFloat(monthlyIncome) : undefined,
      });
      return NextResponse.json({ success: true, summary });
    }

    if (action === "clear_expenses") {
      clearAllExpenses();
      return NextResponse.json({ success: true, summary: getDemoSummary() });
    }

    if (action === "reset_clean") {
      const newAcc = resetToCleanAccount(totalBalance || 0, accountName || "Mi Billetera Principal");
      return NextResponse.json({ success: true, account: newAcc, summary: getDemoSummary() });
    }

    if (action === "set_direct") {
      const summary = setDirectFinances({
        totalBalance: totalBalance !== undefined ? parseFloat(totalBalance) : undefined,
        monthlyIncome: monthlyIncome !== undefined ? parseFloat(monthlyIncome) : undefined,
        monthlyExpense: monthlyExpense !== undefined ? parseFloat(monthlyExpense) : undefined,
        accountName,
        clearExpenses: Boolean(clearExpenses),
      });
      return NextResponse.json({ success: true, summary });
    }

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
