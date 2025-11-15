const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const clearBtn = document.getElementById('clear-btn');
const statusText = document.getElementById('status-text');

let isSending = false;
let messages = [];

// 메시지 DOM 추가
function addMessage(role, content) {
  const wrapper = document.createElement('div');
  wrapper.className = `message ${role}`;

  const inner = document.createElement('div');
  inner.className = 'message-inner';
  inner.textContent = content;

  wrapper.appendChild(inner);
  chatWindow.appendChild(wrapper);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// 상태 표시
function setStatus(text) {
  statusText.textContent = text;
}

// 서버 호출
async function sendToServer() {
  if (isSending) return;
  const text = userInput.value.trim();
  if (!text) return;

  // 입력 창 비우고 내 메시지 먼저 찍기
  userInput.value = '';
  addMessage('user', text);

  // messages 배열에도 저장
  messages.push({ role: 'user', content: text });

  isSending = true;
  sendBtn.disabled = true;
  setStatus('생각 중…');

  try {
    const res = await fetch('/api/luwain-radio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.error('API error', error);
      addMessage('assistant', '음… 서버에서 오류가 났어. 잠시 후에 다시 시도해 보자.');
      return;
    }

    const data = await res.json();
    const reply = data.reply || '(응답이 비어 있어…)';

    messages.push({ role: 'assistant', content: reply });
    addMessage('assistant', reply);
  } catch (e) {
    console.error(e);
    addMessage('assistant', '네트워크 오류 같아. 인터넷 상태를 한 번만 점검해 줄래?');
  } finally {
    isSending = false;
    sendBtn.disabled = false;
    setStatus('대기 중');
    userInput.focus();
  }
}

// 이벤트 바인딩
sendBtn.addEventListener('click', sendToServer);

userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendToServer();
  }
});

clearBtn.addEventListener('click', () => {
  if (!confirm('대화를 전부 지울까? (되돌릴 수 없음)')) return;
  messages = [];
  chatWindow.innerHTML = '';
});

// 초기 포커스
window.addEventListener('load', () => {
  userInput.focus();
});
