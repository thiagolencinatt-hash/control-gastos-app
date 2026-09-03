import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getDemoGoals,
  addDemoGoal,
  updateDemoGoal,
  deleteDemoGoal,
  clearAllGoals,
  distributeSalaryToGoals,
} from "@/lib/demo-data";

export async function GET(req: NextRequest) {
  const isDemo = req.cookies.get("finance_demo_session")?.value === "true";
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  if (isDemo) {
    let list = [...getDemoGoals()];
    if (type) list = list.filter((g) => g.type === type);
    return NextResponse.json(list);
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      let list = [...getDemoGoals()];
      if (type) list = list.filter((g) => g.type === type);
      return NextResponse.json(list);
    }

    let query = supabase
      .from("savings_goals")
      .select("*")
      .eq("user_id", user.id)
      .order("priority")
      .order("created_at");

    if (type) query = query.eq("type", type);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    let list = [...getDemoGoals()];
    if (type) list = list.filter((g) => g.type === type);
    return NextResponse.json(list);
  }
}

export async function POST(req: NextRequest) {
  const isDemo = req.cookies.get("finance_demo_session")?.value === "true";
  const body = await req.json();

  if (body.action === "clear_all") {
    clearAllGoals();
    return NextResponse.json({ success: true, count: 0 });
  }

  if (body.action === "distribute_salary") {
    const updated = distributeSalaryToGoals(body.allocations || []);
    return NextResponse.json({ success: true, goals: updated });
  }

  if (isDemo) {
    const newGoal = addDemoGoal(body);
    return NextResponse.json(newGoal, { status: 201 });
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const newGoal = addDemoGoal(body);
      return NextResponse.json(newGoal, { status: 201 });
    }

    const { data, error } = await supabase
      .from("savings_goals")
      .insert({ ...body, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch {
    const newGoal = addDemoGoal(body);
    return NextResponse.json(newGoal, { status: 201 });
  }
}

export async function PATCH(req: NextRequest) {
  const { id, action, amount, ...updates } = await req.json();

  if (action === "add_funds") {
    const existing = getDemoGoals().find((g) => g.id === id);
    if (existing) {
      const newAmount = (existing.current_amount || 0) + (amount || 0);
      updateDemoGoal(id, { current_amount: newAmount, is_completed: newAmount >= existing.target_amount });
    }
    return NextResponse.json({ success: true });
  }

  updateDemoGoal(id, updates);

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("savings_goals").update(updates).eq("id", id).eq("user_id", user.id);
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
    clearAllGoals();
    return NextResponse.json({ success: true });
  }

  deleteDemoGoal(id);

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("savings_goals").delete().eq("id", id).eq("user_id", user.id);
    }
  } catch {
    // fallback
  }

  return NextResponse.json({ success: true });
}
