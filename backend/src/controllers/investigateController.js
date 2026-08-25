const axios = require("axios");
const Scan = require("../models/Scan");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

// @route POST /api/investigate
// Body: { text?: string, url?: string }
// Combines text + URL analysis into a single fused risk assessment
// (Milestone 11 — Scam Investigation Engine)
const investigate = async (req, res, next) => {
  try {
    const { text, url } = req.body;
    if (!text && !url) {
      return res
        .status(400)
        .json({ message: "Provide at least one of: text, url" });
    }

    const { data } = await axios.post(`${AI_SERVICE_URL}/investigate`, {
      text,
      url,
    });

    const scan = await Scan.create({
      user: req.user._id,
      type: "message", // investigation is stored as a composite message-type scan
      input: { text, url },
      riskScore: data.finalRisk,
      riskLevel: data.riskLevel,
      category: data.category,
      reasons: data.reasons,
    });

    res.status(201).json({ ...data, scanId: scan._id });
  } catch (err) {
    next(err);
  }
};

module.exports = { investigate };
