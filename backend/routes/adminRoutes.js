const express = require("express");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const {
  getAdminStats,
  getOfficers,
  assignIssue
} = require("../controllers/adminController");

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles("admin"));

// Admin access test
router.get("/test", (req, res) => {
  res.json({
    message: "Welcome to CivicPulse Admin API!",
  });
});

// Admin statistics
router.get("/stats", getAdminStats);

// Get all field officers
router.get("/officers", getOfficers);

// Assign an issue to a field officer
router.post("/issues/:id/assign", assignIssue);

module.exports = router;