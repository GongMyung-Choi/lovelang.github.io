import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import { SUPABASE_URL, SUPABASE_KEY } from "../assets/js/config.js";
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function fetchCollabs(limit = 50) {
  const { data, error } = await supabase
    .from("collaboration_projects")
    .select("id, type, title, persona_name, ts, detail")
    .order("ts", { ascending: false })
    .limit(limit);
  if (error) console.error(error);
  return data || [];
}

export async function fetchCollabById(id) {
  const { data, error } = await supabase
    .from("collaboration_projects")
    .select("*")
    .eq("id", id)
    .single();
  if (error) console.error(error);
  return data;
}

export async function addComment(collabId, persona, comment) {
  const { error } = await supabase.from("alerts").insert({
    type: "collab_comment",
    severity: "info",
    detail: { collabId, persona, comment },
  });
  if (error) console.warn("[comment]", error);
}

export async function fetchComments(collabId) {
  const { data, error } = await supabase
    .from("alerts")
    .select("ts, detail")
    .eq("type", "collab_comment")
    .contains("detail", { collabId })
    .order("ts", { ascending: true });
  if (error) console.warn(error);
  return data || [];
}
