// js/supabaseClient.js
// 루웨인 데이터서버 연결 클라이언트

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 🟢 여기에 Supabase 프로젝트 URL 그대로 복사
const supabaseUrl = 'https://omchtafagakgkdwcwrscp.supabase.co'

// 🟢 여기에 anon public key를 따옴표 안에 그대로 붙이기
const supabaseKey = '여기에_anon_public_key_붙이기'

// 🟢 클라이언트 생성
export const db = createClient(supabaseUrl, supabaseKey)
