# Luwein Autosave Proxy (Supabase-backed)

This package gives you **one-shot autosave** into Supabase from your front-end without exposing secrets.
You can deploy **either** Supabase Edge Function, Vercel API route, or Cloudflare Worker.

## 0) Create table (run inside Supabase SQL Editor)

Run both files in `supabase/sql`:
- 01_schema.sql
- 02_policies.sql

## 1) Deploy as Supabase Edge Function (recommended)

Place `supabase/functions/record-memory/index.ts` into your project, then:

```bash
npx supabase functions deploy record-memory
npx supabase secrets set SUPABASE_URL=https://YOUR-REF.supabase.co
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE
npx supabase secrets set SHARED_SECRET=ANY_LONG_RANDOM_STRING   # optional
```

Invoke URL will be:
`https://YOUR-REF.supabase.co/functions/v1/record-memory`

Test:
```bash
curl -X POST   -H "Content-Type: application/json"   -H "x-shared-secret: ANY_LONG_RANDOM_STRING"   -d '{"path":"test/page","content":{"ok":true},"meta":{"note":"hello"}}'   https://YOUR-REF.supabase.co/functions/v1/record-memory
```

## 2) Deploy on Vercel (Next.js /api)

Copy `vercel/api/record-memory.ts` into `/api/record-memory.ts` (or app router).
Set env vars in Vercel Project:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- SHARED_SECRET (optional)

Then call from the client: `/api/record-memory`

## 3) Deploy on Cloudflare Workers

Copy `cloudflare/worker.js`, then in `wrangler.toml` set:
```toml
name = "luwein-autosave"
main = "cloudflare/worker.js"
compatibility_date = "2024-10-01"
[vars]
SUPABASE_URL = "https://YOUR-REF.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = "YOUR_SERVICE_ROLE"
SHARED_SECRET = "ANY_LONG_RANDOM_STRING"
```
Deploy:
```bash
npx wrangler deploy
```

## 4) Client-side usage

Add `client/autosave.js` to your site, then:

```html
<script type="module">
  import { autosave } from "/client/autosave.js";
  autosave("https://YOUR-REF.supabase.co/functions/v1/record-memory", {
    path: "language_of_reverberation/language_selection/index.html",
    content: { op: "save", step: "language_selection", lang: localStorage.getItem("ulrim_lang") || "ko" },
    meta: { ua: navigator.userAgent, ts: new Date().toISOString() }
    // sharedSecret: "ANY_LONG_RANDOM_STRING" // only if you set SHARED_SECRET
  }).then(console.log).catch(console.error);
</script>
```

---

### Notes
- **Never** expose SERVICE_ROLE on the client. Only the proxy (Edge Function/Worker) should hold it.
- RLS is enabled; inserts are performed with service role via the proxy, so no anon policy is needed.
- You can add indexing later: `create index on public.memory_events ((content->>'op'));`