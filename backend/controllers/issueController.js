const pool = require("../db");
const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "civicpulse/issues",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    stream.end(fileBuffer);
  });
};

const getAllIssues = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM issues ORDER BY id ASC"
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getIssueById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM issues WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const createIssue = async (req, res) => {
  const client = await pool.connect();

  try {
    const user_id = req.user.id;

    const {
      category_id,
      title,
      description,
      priority,
      latitude,
      longitude,
    } = req.body;

    if (!category_id || !title || !description) {
      return res.status(400).json({
        message: "Required fields are missing",
      });
    }

    let image_url = null;

    // Upload image to Cloudinary if citizen selected one
    if (req.file) {
      const uploadedImage = await uploadToCloudinary(req.file.buffer);
      image_url = uploadedImage.secure_url;
    }

    await client.query("BEGIN");

    const issueResult = await client.query(
      `INSERT INTO issues
      (
        user_id,
        category_id,
        title,
        description,
        priority,
        status,
        latitude,
        longitude,
        image_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        user_id,
        category_id,
        title,
        description,
        priority || "medium",
        "submitted",
        latitude || null,
        longitude || null,
        image_url,
      ]
    );

    const newIssue = issueResult.rows[0];

    await client.query(
      `INSERT INTO issue_status_history
      (
        issue_id,
        status,
        changed_by,
        note
      )
      VALUES ($1, $2, $3, $4)`,
      [
        newIssue.id,
        "submitted",
        user_id,
        "Issue submitted",
      ]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Issue submitted successfully",
      issue: newIssue,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  } finally {
    client.release();
  }
};

const updateIssue = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    const {
      category_id,
      title,
      description,
      priority,
      status,
      latitude,
      longitude,
      image_url,
    } = req.body;

    if (!category_id || !title || !description || !priority || !status) {
      return res.status(400).json({
        message: "Required fields are missing",
      });
    }

    await client.query("BEGIN");

    // Get the issue before updating
    const oldIssueResult = await client.query(
      "SELECT * FROM issues WHERE id = $1",
      [id]
    );

    if (oldIssueResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Issue not found",
      });
    }

    const oldIssue = oldIssueResult.rows[0];

    // Update issue
    const result = await client.query(
      `UPDATE issues
       SET category_id = $1,
           title = $2,
           description = $3,
           priority = $4,
           status = $5,
           latitude = $6,
           longitude = $7,
           image_url = $8,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [
        category_id,
        title,
        description,
        priority,
        status,
        latitude || null,
        longitude || null,
        image_url || null,
        id,
      ]
    );

    const updatedIssue = result.rows[0];

    // Only add history if status actually changed
    if (oldIssue.status !== status) {
      await client.query(
        `INSERT INTO issue_status_history
         (issue_id, status, changed_by, note)
         VALUES ($1, $2, $3, $4)`,
        [
          id,
          status,
          req.user.id,
          `Status changed from ${oldIssue.status} to ${status}`,
        ]
      );
    }

    await client.query("COMMIT");

    res.status(200).json({
      message: "Issue updated successfully",
      issue: updatedIssue,
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error(error.message);

    res.status(500).json({
      message: "Server error",
    });
  } finally {
    client.release();
  }
};

const deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM issues WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }

    res.status(200).json({
      message: "Issue deleted successfully",
      deletedIssue: result.rows[0],
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getIssueHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const issueCheck = await pool.query(
      "SELECT id FROM issues WHERE id = $1",
      [id]
    );

    if (issueCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }

    const result = await pool.query(
      `SELECT
        id,
        issue_id,
        status,
        changed_by,
        note,
        changed_at
       FROM issue_status_history
       WHERE issue_id = $1
       ORDER BY changed_at ASC`,
      [id]
    );

    res.status(200).json(result.rows);

  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getAllIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
  getIssueHistory,
};