export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { message } = req.body;

    // 간단한 테스트 응답
    return res.status(200).json({
      reply: `루웨인 서버 연결 성공! 받은 메시지: ${message}`,
    });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
