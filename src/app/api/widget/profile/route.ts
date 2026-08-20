import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, name, phone } = body;

    if (!customerId) {
      return NextResponse.json({ error: "customerId is required" }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const updates: Record<string, string> = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.from("customers").update(updates).eq("id", customerId);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[widget/profile] 更新失败:", error);
    const msg = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
