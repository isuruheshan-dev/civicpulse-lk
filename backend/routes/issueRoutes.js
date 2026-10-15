const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

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
  getIssueHistory
} = require("../controllers/issueController");

router.use(authenticateToken);

router.get("/", getAllIssues);
router.get("/:id", getIssueById);
router.post("/", authorizeRoles("citizen", "admin"), upload.single("image"), createIssue);
router.put("/:id", authorizeRoles("field_officer", "admin"), updateIssue);
router.delete("/:id", authorizeRoles("admin"), deleteIssue);
router.get("/:id/history", getIssueHistory);

module.exports = router;