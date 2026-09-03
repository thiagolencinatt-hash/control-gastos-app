import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEMO_CATEGORIES } from "@/lib/demo-data";

export async function GET(req: NextRequest) {
  const isDemo = req.cookies.get("finance_demo_session")?.value === "true";
  if (isDemo) return NextResponse.json(DEMO_CATEGORIES);

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json(DEMO_CATEGORIES);

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .order("is_default", { ascending: false })
      .order("name");

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json(DEMO_CATEGORIES);
  }
}
