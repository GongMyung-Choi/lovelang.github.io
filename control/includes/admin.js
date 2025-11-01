<script>
// --- Supabase bootstrap (expects /assets/js/supabase.js to set window.supabaseClient or expose createSupabaseClient) ---
(async function ensureSupabase(){
  if(!window.supabase){
    // if user placed a helper at /assets/js/supabase.js
    try{ await import('/assets/js/supabase.js'); }catch(e){}
  }
  // fallback: allow inline init via meta tags if needed
  if(!window.supabase){
    console.warn('Supabase global not found. Make sure /assets/js/supabase.js loads window.supabase');
  }
})();

// --- tiny util logger (persists to localStorage) ---
const LOG_KEY='luwein_admin_logs';
function adminLog(level,msg,meta={}){
  const arr = JSON.parse(localStorage.getItem(LOG_KEY)||'[]');
  arr.unshift({ts:new Date().toISOString(), level, msg, meta});
  if(arr.length>500) arr.pop();
  localStorage.setItem(LOG_KEY, JSON.stringify(arr));
  console[level==='error'?'error':(level==='warn'?'warn':'log')](msg, meta);
}
window.adminLog=adminLog;

// --- auth utils ---
async function getSB(){
  // prefer prebuilt client
  if(window.supabase?.from) return window.supabase;
  // else try to read window.createSupabaseClient()
  if(window.createSupabaseClient){
    window.supabase = window.createSupabaseClient();
    return window.supabase;
  }
  throw new Error('Supabase client not available');
}
async function getUser(){
  try{
    const sb=await getSB();
    const { data } = await sb.auth.getUser();
    return data?.user || null;
  }catch(e){ adminLog('error','getUser failed', {e}); return null;}
}
async function requireAuth(){
  const user = await getUser();
  if(!user){ location.href='/admin/admin.html'; return null; }
  return user;
}
function qs(s,root=document){return root.querySelector(s)}
function qsa(s,root=document){return Array.from(root.querySelectorAll(s))}

// --- table loader generic ---
async function loadTable({table, limit=50, order='created_at', desc=true, target}){
  const sb=await getSB();
  let q=sb.from(table).select('*').limit(limit);
  if(order) q=q.order(order,{ascending:!desc});
  const { data, error } = await q;
  const out = qs(target);
  if(error){ out.innerHTML = `<div class="panel" style="border-color:#7f1d1d;color:#fecaca">⚠ ${error.message}</div>`; adminLog('error','loadTable', {table,error}); return; }
  if(!data?.length){ out.innerHTML = `<div class="panel small">데이터 없음</div>`; return; }
  const cols = Object.keys(data[0]);
  const head = `<tr>${cols.map(c=>`<th>${c}</th>`).join('')}</tr>`;
  const rows = data.map(r=>`<tr>${cols.map(c=>`<td>${escapeHtml(String(r[c]??''))}</td>`).join('')}</tr>`).join('');
  out.innerHTML = `<div class="panel"><div class="row small">총 ${data.length}건</div><div style="overflow:auto"><table class="table">${head}${rows}</table></div></div>`;
}
function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]))}

// --- ping / status ---
async function supabaseStatus(badgeSel){
  const el = qs(badgeSel);
  try{
    const sb=await getSB();
    // a tiny lightweight call
    const { error } = await sb.from('ping_check').select('id').limit(1);
    if(error){ el.classList.remove('ok'); el.classList.add('err'); el.textContent='Supabase 연결: 오류'; adminLog('warn','status error',{error}); }
    else{ el.classList.remove('err'); el.classList.add('ok'); el.textContent='Supabase 연결: 정상'; }
  }catch(e){ el.classList.add('err'); el.textContent='Supabase 연결: 미탑재'; }
}

// --- demo actions (safe no-op writes require RLS rules) ---
async function appendTestLog(note='manual'){
  const arr = JSON.parse(localStorage.getItem(LOG_KEY)||'[]');
  adminLog('info','note added',{note});
  return arr.length;
}

// --- performance monitor (client-sided) ---
function getPerfSnapshot(){
  const t = performance.timing || {};
  const nav = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0])||null;
  return {
    now: new Date().toISOString(),
    userAgent: navigator.userAgent,
    mem: (performance.memory?{ jsHeap:(performance.memory.usedJSHeapSize||0)}:null),
    navType: nav?.type || 'unknown',
    paint: (performance.getEntriesByType? performance.getEntriesByType('paint') : []),
  }
}
window.getPerfSnapshot=getPerfSnapshot;
</script>
