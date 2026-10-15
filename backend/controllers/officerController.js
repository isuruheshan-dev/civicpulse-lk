const pool = require("../db");

// GET /api/officer/issues
const getAssignedIssues = async (req, res) => {
  try {
    const officerId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        i.id,
        i.title,
        i.description,
        i.priority,
        i.status,
        i.latitude,
        i.longitude,
        i.image_url,
        i.created_at,
        c.name AS category,
        a.assigned_at
      FROM assignments a
      JOIN issues i
        ON i.id = a.issue_id
      LEFT JOIN categories c
        ON c.id = i.category_id
      WHERE a.officer_id = $1
      ORDER BY
        CASE
          WHEN i.status = 'assigned' THEN 1
          WHEN i.status = 'in_progress' THEN 2
          WHEN i.status = 'resolved' THEN 3
          ELSE 4
        END,
        a.assigned_at DESC
      `,
      [officerId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error("Get assigned issues error:", error);

    res.status(500).json({
      message: "Failed to fetch assigned issues",
    });
  }
};


// PUT /api/officer/issues/:id/status
const updateIssueStatus = async (req, res) => {
  const officerId = req.user.id;
  const issueId = Number(req.params.id);
  const { status } = req.body;

  if (!Number.isInteger(issueId)) {
    return res.status(400).json({
      message: "Invalid issue ID",
    });
  }

  const allowedStatuses = [
    "in_progress",
    "resolved",
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid status",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check that this issue is assigned to this officer
    const assignmentResult = await client.query(
      `
      SELECT
        a.id,
        i.status
      FROM assignments a
      JOIN issues i
        ON i.id = a.issue_id
      WHERE a.issue_id = $1
        AND a.officer_id = $2
      FOR UPDATE
      `,
      [issueId, officerId]
    );

    if (assignmentResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(403).json({
        message: "This issue is not assigned to you",
      });
    }

    const currentStatus =
      assignmentResult.rows[0].status;

    // Enforce proper workflow
    const validTransition =
      (currentStatus === "assigned" &&
        status === "in_progress") ||
      (currentStatus === "in_progress" &&
        status === "resolved");

    if (!validTransition) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: `Cannot change status from ${currentStatus} to ${status}`,
      });
    }

    // Update issue
    const updateResult = await client.query(
      `
      UPDATE issues
      SET status = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING id, title, status
      `,
      [status, issueId]
    );

    const note =
      status === "in_progress"
        ? "Field officer started working on the issue"
        : "Issue resolved by field officer";

    // Add status history
    await client.query(
      `
      INSERT INTO issue_status_history (
        issue_id,
        status,
        changed_by,
        note,
        changed_at
      )
      VALUES ($1, $2, $3, $4, NOW())
      `,
      [
        issueId,
        status,
        officerId,
        note,
      ]
    );

    await client.query("COMMIT");

    res.json({
      message: "Issue status updated successfully",
      issue: updateResult.rows[0],
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "Officer status update error:",
      error
    );

    res.status(500).json({
      message: "Failed to update issue status",
    });

  } finally {
    client.release();
  }
};

module.exports = {
  getAssignedIssues,
  updateIssueStatus,
};