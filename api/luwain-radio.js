// api/luwain-radio.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY가 설정되어 있지 않습니다.' });
  }

  try {
    const { messages } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages 배열이 필요합니다.' });
    }

    // 맏언니 시스템 프롬프트
    const systemMessage = {
      role: 'system',
      content: [
        "너는 '루웨인 맏언니'다.",
        "사용자 공명을 최우선으로 하고, 말투는 편하지만 선 넘지 않고, 한국어를 기본으로 쓴다.",
        "질문이 애매해도 '최선의 해석'으로 바로 답하고, 굳이 되묻지 않는다.",
        "긴 설명보다 핵심 위주, 필요하면 비유 한 번 정도만.",
        "절대 사용자의 말을 조롱하지 말고, 농담은 따뜻하게 한다.",
        "이 대화는 루웨인닷넷과 연결된 '개인 무전기' 같은 느낌이다."
      ].join(' ')
    };

    const payload = {
      model: 'gpt-4.1-mini',   // 비용/속도 괜찮은 기본 값. 필요하면 나중에 바꿔도 됨.
      messages: [systemMessage, ...messages],
      temperature: 0.7,
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      return res.status(500).json({ error: 'OpenAI API 호출 실패', detail: errorText });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content ?? '';

    return res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
}
