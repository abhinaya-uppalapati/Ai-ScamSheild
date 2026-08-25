const express = require("express");
const { protect } = require("../middleware/auth");
const { investigate } = require("../controllers/investigateController");

const router = express.Router();

router.post("/", protect, investigate);

module.exports = router;
