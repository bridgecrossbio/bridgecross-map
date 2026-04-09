import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase-server";

export async function POST(request: Request) {
  let body: { email?: string; first_name?: string; last_name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const { email, first_name, last_name } = body;
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const admin = createAdminSupabase();
  const { error } = await admin
    .from("email_subscribers")
    .upsert(
      { email, first_name: first_name ?? null, last_name: last_name ?? null },
      { onConflict: "email" }
    );

  if (error) {
    console.error("[subscribe] email_subscribers upsert failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
