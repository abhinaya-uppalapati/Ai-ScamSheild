const express = require("express");
const { protect } = require("../middleware/auth");
const {
  scanMessage,
  scanUrl,
  scanEmail,
  getScans,
  getScanById,
  submitFeedback,
} = require("../controllers/scanController");

const router = express.Router();

router.use(protect);

router.post("/message", scanMessage);
router.post("/url", scanUrl);
router.post("/email", scanEmail);
router.get("/", getScans);
router.get("/:id", getScanById);
router.patch("/:id/feedback", submitFeedback);

module.exports = router;
