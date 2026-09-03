import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getDemoInstallments,
  addDemoInstallment,
  updateDemoInstallment,
  deleteDemoInstallment,
  clearAllInstallments,
} from "@/lib/demo-data";

export async function GET(req: NextRequest) {
  const isDemo = req.cookies.get("finance_demo_session")?.value === "true";
  const { searchParams } = new URL(req.url);
  const active = searchParams.get("active");

  if (isDemo) {
    let list = [...getDemoInstallments()];
    if (active !== null) list = list.filter((i) => i.is_active === (active === "true"));
    return NextResponse.json(list);
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      let list = [...getDemoInstallments()];
      if (active !== null) list = list.filter((i) => i.is_active === (active === "true"));
      return NextResponse.json(list);
    }

    let query = supabase
      .from("installments_summary")
      .select("*")
      .eq("user_id", user.id)
      .order("next_due_date");

    if (active !== null) query = query.eq("is_active", active === "true");

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    let list = [...getDemoInstallments()];
    if (active !== null) list = list.filter((i) => i.is_active === (active === "true"));
    return NextResponse.json(list);
  }
}

export async function POST(req: NextRequest) {
  const isDemo = req.cookies.get("finance_demo_session")?.value === "true";
  const body = await req.json();

  if (body.action === "clear_all") {
    clearAllInstallments();
    return NextResponse.json({ success: true, count: 0 });
  }

  if (isDemo) {
    const newInst = addDemoInstallment(body);
    return NextResponse.json(newInst, { status: 201 });
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const newInst = addDemoInstallment(body);
      return NextResponse.json(newInst, { status: 201 });
    }

    const totalPaid = (body.installment_amount || 0) * (body.total_installments || 1);
    const cftTotal = (body.total_amount || 0) > 0 ? ((totalPaid / body.total_amount) - 1) * 100 : 0;

    const { data, error } = await supabase
      .from("installments")
      .insert({
        ...body,
        user_id: user.id,
        cft_total: parseFloat(cftTotal.toFixed(2)),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch {
    const newInst = addDemoInstallment(body);
    return NextResponse.json(newInst, { status: 201 });
  }
}

export async function PATCH(req: NextRequest) {
  const { id, action, ...updates } = await req.json();

  if (action === "pay") {
    const existing = getDemoInstallments().find((i) => i.id === id);
    if (existing) {
      const newPaid = existing.paid_installments + 1;
      updateDemoInstallment(id, {
        paid_installments: newPaid,
        is_active: newPaid < existing.total_installments,
      });
    }
    return NextResponse.json({ success: true });
  }

  updateDemoInstallment(id, updates);

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("installments").update(updates).eq("id", id).eq("user_id", user.id);
    }
  } catch {
    // fallback
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { id, action } = body;

  if (action === "clear_all") {
    clearAllInstallments();
    return NextResponse.json({ success: true });
  }

  deleteDemoInstallment(id);

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("installments").update({ is_active: false }).eq("id", id).eq("user_id", user.id);
    }
  } catch {
    // fallback
  }

  return NextResponse.json({ success: true });
}
