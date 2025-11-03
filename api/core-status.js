export default function handler(req, res) {
  try {
    res.status(200).json({
      message: "루웨인 코어 활성화 완료",
      status: "active",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: "Core not responding", details: err });
  }
}
