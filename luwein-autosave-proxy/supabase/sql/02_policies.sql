-- 02_policies.sql
-- RLS: deny all by default; access via service role only.
drop policy if exists "allow_anon_select_memory_events" on public.memory_events;
drop policy if exists "allow_anon_insert_memory_events" on public.memory_events;
-- We intentionally do not add anon policies.
-- Edge Function will use SERVICE ROLE to insert, bypassing RLS.