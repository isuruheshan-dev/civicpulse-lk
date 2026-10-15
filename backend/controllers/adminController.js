const pool = require("../db");

// GET /api/admin/stats
const getAdminStats = async (req, res) => {
  try {
    // Main statistics
    const statsResult = await pool.query(`
      SELECT
        COUNT(*)::int AS "totalIssues",

        COUNT(*) FILTER (
          WHERE status NOT IN ('resolved', 'rejected')
        )::int AS "openIssues",

        COUNT(*) FILTER (
          WHERE status = 'resolved'
        )::int AS "resolvedIssues",

        COUNT(*) FILTER (
          WHERE priority = 'high'
        )::int AS "highPriorityIssues"

      FROM issues
    `);

    // Issues grouped by category
    const categoryResult = await pool.query(`
      SELECT
        c.id,
        c.name AS category,
        COUNT(i.id)::int AS count
      FROM categories c
      LEFT JOIN issues i ON i.category_id = c.id
      GROUP BY c.id, c.name
      ORDER BY count DESC, c.name
    `);

    // Recent issues
    const recentResult = await pool.query(`
      SELECT
        id,
        title,
        priority,
        status,
        created_at
      FROM issues
      ORDER BY created_at DESC, id DESC
      LIMIT 5
    `);

    res.json({
      ...statsResult.rows[0],
      issuesByCategory: categoryResult.rows,
      recentIssues: recentResult.rows,
    });

  } catch (error) {
    console.error("Admin stats error:", error);

    res.status(500).json({
      message: "Failed to fetch admin statistics",
    });
  }
};

// GET /api/admin/officers
const getOfficers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, full_name, email
      FROM users
      WHERE role = 'field_officer'
      ORDER BY full_name
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Get officers error:", error);

    res.status(500).json({
      message: "Failed to fetch field officers",
    });
  }
};


// POST /api/admin/issues/:id/assign
const assignIssue = async (req, res) => {
  const issueId = Number(req.params.id);
  const officerId = Number(req.body.officer_id);
  const adminId = req.user.id;

  if (!Number.isInteger(issueId) || !Number.isInteger(officerId)) {
    return res.status(400).json({
      message: "Valid issue ID and officer ID are required",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check issue
    const issueResult = await client.query(
      `
      SELECT id, title, status
      FROM issues
      WHERE id = $1
      FOR UPDATE
      `,
      [issueId]
    );

    if (issueResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Issue not found",
      });
    }

    // Check that selected user is really a field officer
    const officerResult = await client.query(
      `
      SELECT id, full_name, email
      FROM users
      WHERE id = $1
        AND role = 'field_officer'
      `,
      [officerId]
    );

    if (officerResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "Selected user is not a valid field officer",
      });
    }

    // Check whether this issue already has an assignment
    const assignmentResult = await client.query(
      `
      SELECT id
      FROM assignments
      WHERE issue_id = $1
      ORDER BY id DESC
      LIMIT 1
      `,
      [issueId]
    );

    let assignment;

    if (assignmentResult.rows.length > 0) {
      // Reassign existing issue
      const updateAssignment = await client.query(
        `
        UPDATE assignments
        SET officer_id = $1,
            assigned_by = $2,
            assigned_at = NOW()
        WHERE id = $3
        RETURNING *
        `,
        [
          officerId,
          adminId,
          assignmentResult.rows[0].id,
        ]
      );

      assignment = updateAssignment.rows[0];

    } else {
      // First assignment
      const newAssignment = await client.query(
        `
        INSERT INTO assignments (
          issue_id,
          officer_id,
          assigned_by,
          assigned_at
        )
        VALUES ($1, $2, $3, NOW())
        RETURNING *
        `,
        [
          issueId,
          officerId,
          adminId,
        ]
      );

      assignment = newAssignment.rows[0];
    }

    // Change issue status
    await client.query(
      `
      UPDATE issues
      SET status = 'assigned',
          updated_at = NOW()
      WHERE id = $1
      `,
      [issueId]
    );

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
      VALUES ($1, 'assigned', $2, $3, NOW())
      `,
      [
        issueId,
        adminId,
        `Assigned to ${officerResult.rows[0].full_name}`,
      ]
    );

    await client.query("COMMIT");

    res.json({
      message: "Issue assigned successfully",
      issue: {
        id: issueId,
        status: "assigned",
      },
      officer: officerResult.rows[0],
      assignment,
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Assign issue error:", error);

    res.status(500).json({
      message: "Failed to assign issue",
    });

  } finally {
    client.release();
  }
};

module.exports = {
  getAdminStats,
  getOfficers,
  assignIssue
};