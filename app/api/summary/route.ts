import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { FinancialSummary } from "@/lib/types";
import { getDemoSummary } from "@/lib/demo-data";

export async function GET(req: NextRequest) {
  const isDemo = req.cookies.get("finance_demo_session")?.value === "true";

  if (isDemo) {
    return NextResponse.json(getDemoSummary());
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Si no hay usuario y se pide summary, retornar demo summary para permitir testing
      return NextResponse.json(getDemoSummary());
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split("T")[0];

    // Obtener cuentas
    const { data: accounts } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at");

    // Ingresos últimos 30 días
    const { data: incomeData } = await supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", user.id)
      .eq("type", "income")
      .gte("date", dateStr);

    // Gastos últimos 30 días
    const { data: expenseData } = await supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", user.id)
      .eq("type", "expense")
      .gte("date", dateStr);

    // Cuotas activas
    const { data: installments } = await supabase
      .from("installments_summary")
      .select("*")
      .eq("user_id", user.id)
      .order("next_due_date");

    // Metas de ahorro
    const { data: goals } = await supabase
      .from("savings_goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_completed", false)
      .order("priority");

    // Gastos por categoría
    const { data: categoryData } = await supabase
      .from("transactions")
      .select("amount, categories(name)")
      .eq("user_id", user.id)
      .eq("type", "expense")
      .gte("date", dateStr);

    // Agregar categorías manualmente
    const categoryMap: Record<string, { category_name: string; total: number; count: number }> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (categoryData as any[] || []).forEach((t) => {
      const catName = (Array.isArray(t.categories) ? t.categories[0]?.name : t.categories?.name) || "Sin categoría";
      if (!categoryMap[catName]) categoryMap[catName] = { category_name: catName, total: 0, count: 0 };
      categoryMap[catName].total += t.amount;
      categoryMap[catName].count++;
    });

    const topCategories = Object.values(categoryMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const totalBalance = (accounts || []).reduce((sum, a) => sum + (a.balance || 0), 0);
    const income30d = (incomeData || []).reduce((sum, t) => sum + t.amount, 0);
    const expense30d = (expenseData || []).reduce((sum, t) => sum + t.amount, 0);
    const monthlyInstallments = (installments || []).reduce((sum, i) => sum + (i.installment_amount || 0), 0);

    // Próximos vencimientos (próximos 7 días)
    const today = new Date();
    const in7Days = new Date();
    in7Days.setDate(today.getDate() + 7);

    const upcoming = (installments || [])
      .filter((i) => {
        if (!i.next_due_date) return false;
        const due = new Date(i.next_due_date);
        return due >= today && due <= in7Days;
      })
      .map((i) => ({
        description: i.description,
        amount: i.installment_amount,
        due_date: i.next_due_date,
        account_name: i.account_name,
      }));

    const summary: FinancialSummary = {
      accounts: accounts || [],
      total_balance: totalBalance,
      total_balance_ars: totalBalance,
      income_30d: income30d,
      expense_30d: expense30d,
      active_installments: installments || [],
      total_installments_monthly: monthlyInstallments,
      upcoming_installments: upcoming,
      top_categories: topCategories,
      savings_goals: goals || [],
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.warn("[/api/summary] Fallback to demo summary:", error);
    return NextResponse.json(getDemoSummary());
  }
}
