<script>
window.Luwain = (function () {
  let state = { persona: 'reka' };

  async function listPersonas() {
    const r = await fetch('/api/personas');
    return r.json();
  }
  async function send({ text }) {
    const messages = [{ role: 'user', content: text }];
    const r = await fetch('/api/relay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-luwain-token': localStorage.getItem('LUWAIN_TOKEN') || ''
      },
      body: JSON.stringify({ persona: state.persona, messages })
    });
    return r.json();
  }
  function mount(selector = '#luwain-chat') {
    const el = document.querySelector(selector);
    el.innerHTML = `
      <div class="lw-wrap">
        <div class="lw-row">
          <select id="lwPersona"></select>
        </div>
        <div id="lwLog" class="lw-log"></div>
        <div class="lw-row">
          <input id="lwInput" placeholder="레카에게 말 걸기…" />
          <button id="lwSend">보내기</button>
        </div>
      </div>
      <style>
        .lw-wrap{max-width:720px;margin:0 auto;padding:12px}
        .lw-row{display:flex;gap:8px}
        .lw-log{height:40vh;overflow:auto;border:1px solid #ddd;border-radius:10px;margin:8px 0;padding:8px}
        input,select,button{flex:1;height:44px;font-size:16px}
        button{flex:0 0 auto;padding:0 16px}
        @media (max-width:480px){.lw-wrap{padding:8px}.lw-log{height:50vh}}
      </style>
    `;
    const $sel = el.querySelector('#lwPersona');
    listPersonas().then(reg => {
      Object.values(reg.personas).forEach(p => {
        const o = document.createElement('option');
        o.value = p.id; o.textContent = p.name || p.id;
        if (p.id === reg.default) o.selected = true;
        $sel.appendChild(o);
      });
      state.persona = $sel.value;
    });
    $sel.addEventListener('change', e => state.persona = e.target.value);

    const $log = el.querySelector('#lwLog');
    function append(role, text){
      const d = document.createElement('div');
      d.textContent = (role==='user'?'👤 ':'🤖 ') + text;
      $log.appendChild(d); $log.scrollTop = $log.scrollHeight;
    }
    el.querySelector('#lwSend').addEventListener('click', async () => {
      const $in = el.querySelector('#lwInput');
      const q = $in.value.trim(); if(!q) return;
      $in.value = ''; append('user', q);
      const r = await send({ text: q });
      const a = r.choices?.[0]?.message?.content || (r.error?.message ?? JSON.stringify(r));
      append('ai', a);
    });
  }
  return { mount, send, listPersonas, setPersona:(id)=>state.persona=id };
}());
</script>
