import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
export const supabase = createClient(
  'https://YOUR_PROJECT.supabase.co',
  'public-anon-key'
);

export async function signUp(email, password, nickname) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nickname } }
  });
  if (error) alert(error.message);
  else {
    alert('회원가입 성공! 로그인하세요.');
    location.href = 'login.html';
  }
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) alert(error.message);
  else {
    localStorage.setItem('luwein_user', JSON.stringify(data));
    location.href = '../breathing_room/new_0.html';
  }
}

export async function signOut() {
  await supabase.auth.signOut();
  localStorage.removeItem('luwein_user');
  location.href = 'login.html';
}
