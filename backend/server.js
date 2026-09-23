const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");
const issueRoutes = require("./routes/issueRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/issues", issueRoutes);

const PORT = 5000;

app.get("/", (req, res) => {
  res.json({
    message: "CivicPulse LK API is running"
  });
});

app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "Database connected successfully",
      databaseTime: result.rows[0].now,
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

app.listen(PORT, () => {
  console.log(`CivicPulse server running on port ${PORT}`);
});