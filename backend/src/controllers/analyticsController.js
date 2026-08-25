const Scan = require("../models/Scan");

// @route GET /api/analytics/overview
const getOverview = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [totals, byLevel, byCategory, overTime] = await Promise.all([
      Scan.countDocuments({ user: userId }),

      Scan.aggregate([
        { $match: { user: userId } },
        { $group: { _id: "$riskLevel", count: { $sum: 1 } } },
      ]),

      Scan.aggregate([
        { $match: { user: userId } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      Scan.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const levelCounts = { SAFE: 0, SUSPICIOUS: 0, HIGH_RISK: 0 };
    byLevel.forEach((l) => {
      levelCounts[l._id] = l.count;
    });

    res.json({
      totalScans: totals,
      byRiskLevel: levelCounts,
      byCategory: byCategory.map((c) => ({
        category: c._id || "Unknown",
        count: c.count,
      })),
      scansOverTime: overTime.map((d) => ({ date: d._id, count: d.count })),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getOverview };
