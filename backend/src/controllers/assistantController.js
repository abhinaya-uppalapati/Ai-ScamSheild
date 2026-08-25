const axios = require("axios");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

// @route POST /api/assistant/chat
// Body: { message: string, history?: [{role, content}] }
const chat = async (req, res, next) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ message: "message is required" });
    }

    const { data } = await axios.post(`${AI_SERVICE_URL}/assistant/chat`, {
      message,
      history: history || [],
    });

    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = { chat };
