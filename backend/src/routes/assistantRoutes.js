const express = require("express");
const { protect } = require("../middleware/auth");
const { chat } = require("../controllers/assistantController");

const router = express.Router();

router.post("/chat", protect, chat);

module.exports = router;
