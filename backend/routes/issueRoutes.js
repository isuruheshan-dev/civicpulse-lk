const express = require("express");
const router = express.Router();

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const {
  getAllIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
} = require("../controllers/issueController");

router.use(authenticateToken);

router.get("/", getAllIssues);
router.get("/:id", getIssueById);
router.post("/", authorizeRoles("citizen", "admin"), createIssue);
router.put("/:id", authorizeRoles("field_officer", "admin"), updateIssue);
router.delete("/:id", authorizeRoles("admin"), deleteIssue);

module.exports = router;