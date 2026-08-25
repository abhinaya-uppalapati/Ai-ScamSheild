const axios = require("axios");
const Scan = require("../models/Scan");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

// @route POST /api/scans/message
const scanMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "text is required" });

    const { data } = await axios.post(`${AI_SERVICE_URL}/analyze/message`, {
      text,
    });

    const scan = await Scan.create({
      user: req.user._id,
      type: "message",
      input: text,
      riskScore: data.riskScore,
      riskLevel: data.riskLevel,
      category: data.category,
      reasons: data.reasons,
      tactics: data.tactics || [],
    });

    res.status(201).json(scan);
  } catch (err) {
    next(err);
  }
};

// @route POST /api/scans/url
const scanUrl = async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ message: "url is required" });

    const { data } = await axios.post(`${AI_SERVICE_URL}/analyze/url`, { url });

    const scan = await Scan.create({
      user: req.user._id,
      type: "url",
      input: url,
      riskScore: data.riskScore,
      riskLevel: data.riskLevel,
      category: data.category,
      reasons: data.reasons,
      tactics: data.tactics || [],
    });

    res.status(201).json(scan);
  } catch (err) {
    next(err);
  }
};

// @route POST /api/scans/email
const scanEmail = async (req, res, next) => {
  try {
    const { sender, subject, body, links } = req.body;
    if (!body) return res.status(400).json({ message: "body is required" });

    const { data } = await axios.post(`${AI_SERVICE_URL}/analyze/email`, {
      sender,
      subject,
      body,
      links: links || [],
    });

    const scan = await Scan.create({
      user: req.user._id,
      type: "email",
      input: { sender, subject, body, links },
      riskScore: data.riskScore,
      riskLevel: data.riskLevel,
      category: data.category,
      reasons: data.reasons,
      tactics: data.tactics || [],
    });

    res.status(201).json(scan);
  } catch (err) {
    next(err);
  }
};

// @route POST /api/scans/conversation
const scanConversation = async (req, res, next) => {
  try {
    const { conversation } = req.body;
    if (!conversation) {
      return res.status(400).json({ message: "conversation is required" });
    }

    const { data } = await axios.post(`${AI_SERVICE_URL}/analyze/conversation`, {
      conversation,
    });

    const scan = await Scan.create({
      user: req.user._id,
      type: "conversation",
      input: conversation,
      riskScore: data.riskScore,
      riskLevel: data.riskLevel,
      category: data.category,
      reasons: data.reasons,
      tactics: data.tactics || [],
    });

    res.status(201).json(scan);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/scans
const getScans = async (req, res, next) => {
  try {
    const scans = await Scan.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(scans);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/scans/:id
const getScanById = async (req, res, next) => {
  try {
    const scan = await Scan.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!scan) return res.status(404).json({ message: "Scan not found" });
    res.json(scan);
  } catch (err) {
    next(err);
  }
};

// @route PATCH /api/scans/:id/feedback  (Milestone 15)
const submitFeedback = async (req, res, next) => {
  try {
    const { feedback } = req.body; // "correct" | "incorrect"
    if (!["correct", "incorrect"].includes(feedback)) {
      return res
        .status(400)
        .json({ message: "feedback must be 'correct' or 'incorrect'" });
    }

    const scan = await Scan.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { feedback },
      { new: true }
    );
    if (!scan) return res.status(404).json({ message: "Scan not found" });
    res.json(scan);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  scanMessage,
  scanUrl,
  scanEmail,
  scanConversation,
  getScans,
  getScanById,
  submitFeedback,
};