const pool = require("../db");

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
  try {
    const {
      user_id,
      category_id,
      title,
      description,
      priority,
      latitude,
      longitude,
      image_url,
    } = req.body;

    if (!user_id || !category_id || !title || !description) {
      return res.status(400).json({
        message: "Required fields are missing",
      });
    }

    const result = await pool.query(
      `INSERT INTO issues
      (user_id, category_id, title, description, priority, status, latitude, longitude, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        user_id,
        category_id,
        title,
        description,
        priority,
        "submitted",
        latitude,
        longitude,
        image_url,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const updateIssue = async (req, res) => {
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

    const result = await pool.query(
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
        latitude,
        longitude,
        image_url,
        id,
      ]
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

module.exports = {
  getAllIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
};