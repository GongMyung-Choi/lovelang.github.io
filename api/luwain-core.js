export default function handler(req, res) {
  try {
    res.status(200).json({
      message: "Luwain Core Active",
      domain: "luwain.net",
      status: "✅ online",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      error: "Luwain core not responding",
      details: err.message
    });
  }
}
