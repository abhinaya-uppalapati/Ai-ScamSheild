const User = require("../models/User");
const Scan = require("../models/Scan");

// @route GET /api/admin/stats
const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalScans, byLevel, byCategory, feedbackCounts] =
      await Promise.all([
        User.countDocuments(),
        Scan.countDocuments(),
        Scan.aggregate([
          { $group: { _id: "$riskLevel", count: { $sum: 1 } } },
        ]),
        Scan.aggregate([
          { $group: { _id: "$category", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 1 },
        ]),
        Scan.aggregate([
          { $match: { feedback: { $ne: null } } },
          { $group: { _id: "$feedback", count: { $sum: 1 } } },
        ]),
      ]);

    const levelCounts = { SAFE: 0, SUSPICIOUS: 0, HIGH_RISK: 0 };
    byLevel.forEach((l) => {
      levelCounts[l._id] = l.count;
    });

    const feedback = { correct: 0, incorrect: 0 };
    feedbackCounts.forEach((f) => {
      feedback[f._id] = f.count;
    });

    res.json({
      totalUsers,
      totalScans,
      scamsDetected: levelCounts.HIGH_RISK + levelCounts.SUSPICIOUS,
      mostCommonCategory: byCategory[0]?._id || "N/A",
      byRiskLevel: levelCounts,
      feedback,
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/admin/users
const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({
      createdAt: -1,
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/admin/scans
const listAllScans = async (req, res, next) => {
  try {
    const scans = await Scan.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(scans);
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/admin/users/:id
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats, listUsers, listAllScans, deleteUser };
