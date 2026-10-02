import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Issues() {
  const [issues, setIssues] = useState([]);
  const [message, setMessage] = useState("Loading issues...");

  useEffect(() => {
    const fetchIssues = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("You must login first.");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/issues",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "Failed to load issues.");
          return;
        }

        // Works whether backend returns [] or { issues: [] }
        const issueList = Array.isArray(data)
          ? data
          : data.issues || [];

        setIssues(issueList);

        if (issueList.length === 0) {
          setMessage("No issues have been reported yet.");
        } else {
          setMessage("");
        }
      } catch (error) {
        console.error(error);
        setMessage("Could not connect to the server.");
      }
    };

    fetchIssues();
  }, []);

  return (
    <div className="issues-page">
      <div className="issues-header">
        <div>
          <p className="dashboard-label">Community Reports</p>
          <h1>Reported Issues</h1>
          <p>View local issues and follow their current status.</p>
        </div>

        <Link to="/dashboard" className="back-btn">
          ← Dashboard
        </Link>
      </div>

      {message && <p className="issues-message">{message}</p>}

      <div className="issues-grid">
        {issues.map((issue) => (
          <Link
            to={`/issues/${issue.id}`}
            className="issue-card"
            key={issue.id}
          >
            <div className="issue-card-top">
              <h2>{issue.title}</h2>

              <span className="status-badge">
                {issue.status || "Submitted"}
              </span>
            </div>

            <p className="issue-description">
              {issue.description || "No description"}
            </p>

            <div className="issue-info">
              <span>
                Priority: {issue.priority || "Normal"}
              </span>

              <span>
                Category:{" "}
                {issue.category_name ||
                  issue.category ||
                  issue.category_id ||
                  "N/A"}
              </span>
            </div>

            <span className="view-details">
              View details →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Issues;