async function checkLink(url) {
  try { await fetch(url,{method:'HEAD',mode:'no-cors'}); return true; }
  catch { return false; }
}

async function buildIndex(links){
  const container=document.getElementById('index');
  const results=await Promise.all(links.map(async url=>{
    const ok=await checkLink(url);
    return `<li>${ok?'✅':'⚠️'} <a href="${url}">${url}</a></li>`;
  }));
  container.innerHTML=results.join('');
}
