import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://omcthafaagkdwcwrvscrp.supabase.co'
const SUPABASE_KEY = '복사한 anon key'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// 데이터를 웹 화면에 표시
async function loadData() {
  const { data, error } = await supabase.from('todos2').select('*')
  const container = document.getElementById('result')

  if (error) {
    container.innerHTML = `<p style="color:red;">에러: ${error.message}</p>`
  } else {
    container.innerHTML = data.map(item => `
      <div style="border:1px solid #ccc; margin:10px; padding:10px;">
        <p><b>제목:</b> ${item.제목}</p>
        <p><b>완료:</b> ${item.완료됨}</p>
        <p><b>시간:</b> ${item.타임스탬프}</p>
      </div>
    `).join('')
  }
}

loadData()
