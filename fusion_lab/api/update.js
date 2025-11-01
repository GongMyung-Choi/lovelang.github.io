import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {
    const { lab, progress, key } = req.body;

    // 관리자용 간단한 보안키
    if (key !== process.env.ADMIN_KEY) {
      return res.status(403).json({ error: "invalid key" });
    }

    const filePath = path.join(process.cwd(), "fusion_lab/data", `${lab}.json`);
    const fileData = JSON.parse(fs.readFileSync(filePath, "utf8"));

    fileData.progress = progress;
    fileData.recent_update = new Date().toISOString();

    fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));
    res.status(200).json({ message: `${lab} updated` });
  } catch (err) {
    res.status(500).json({ error: "update failed", details: err.message });
  }
}
