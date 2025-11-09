// vercel/api/record-memory.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge"; // use edge runtime if available

export default async function handler(req: NextRequest) {
  if (req.method !== "POST") return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });

  const SUPABASE_URL = process.env.SUPABASE_URL!;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const SHARED_SECRET = process.env.SHARED_SECRET; // optional

  if (SHARED_SECRET) {
    const provided = req.headers.get("x-shared-secret");
    if (!provided || provided !== SHARED_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: any = null;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  if (!body?.path || !body?.content) {
    return NextResponse.json({ error: "Missing 'path' or 'content'" }, { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase
    .from("memory_events")
    .insert({
      user_id: body.user_id ?? null,
      path: String(body.path),
      content: body.content,
      meta: body.meta ?? null,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id, created_at: data.created_at });
}