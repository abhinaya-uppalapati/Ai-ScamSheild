const mongoose = require("mongoose");

const scanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["message", "url", "email", "conversation"],
      required: true,
    },
    input: {
      type: mongoose.Schema.Types.Mixed, // raw text, url, or {sender, subject, body, links}
      required: true,
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    riskLevel: {
      type: String,
      enum: ["SAFE", "SUSPICIOUS", "HIGH_RISK"],
      required: true,
    },
    category: {
      type: String,
      default: "Unknown",
    },
    reasons: [
      {
        type: String,
      },
    ],
    tactics: [
      {
        type: String,
      },
    ],
    feedback: {
      type: String,
      enum: ["correct", "incorrect", null],
      default: null,
    },
  },
  { timestamps: true }
);

scanSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Scan", scanSchema);