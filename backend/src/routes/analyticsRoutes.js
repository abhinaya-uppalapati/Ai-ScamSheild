const express = require("express");
const { protect } = require("../middleware/auth");
const { getOverview } = require("../controllers/analyticsController");

const router = express.Router();

router.get("/overview", protect, getOverview);

module.exports = router;
