const express = require("express");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const {
  getAssignedIssues,
  updateIssueStatus,
} = require("../controllers/officerController");

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles("field_officer"));

router.get("/issues", getAssignedIssues);

router.put(
  "/issues/:id/status",
  updateIssueStatus
);

module.exports = router;