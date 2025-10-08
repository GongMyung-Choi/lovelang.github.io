import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://omchtafagakgkdwcwrscp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tY2h0YWZhcWdrZHdjcndzY3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODIyNjMsImV4cCI6MjA3NDQ1ODI2M30.vGV6Gfgi1V8agiwL03ho2R7BAwv4CrTp6-RGH0S3-4g'
export const db = createClient(supabaseUrl, supabaseKey)
async function adminLogin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email, password
  });
  if (error) {
    alert("❌ 로그인 실패: " + error.message);
  } else {
    alert("✅ 관리자 로그인 성공!");
    console.log(data);
  }
}
