export default function handler(req, res) {
  const data = {
    status: "ok",
    updated: new Date().toISOString(),
    labs: [
      { name: "AI 음악실", progress: 78 },
      { name: "건축실", progress: 65 },
      { name: "언어·철학실", progress: 82 },
      { name: "전자출판실", progress: 90 }
 { name: "한얼 프로젝트", progress: 72 }
    ]
  };
  res.status(200).json(data);
}
