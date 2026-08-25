const express = require("express");
const { protect, adminOnly } = require("../middleware/auth");
const {
  getStats,
  listUsers,
  listAllScans,
  deleteUser,
} = require("../controllers/adminController");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/stats", getStats);
router.get("/users", listUsers);
router.get("/scans", listAllScans);
router.delete("/users/:id", deleteUser);

module.exports = router;
