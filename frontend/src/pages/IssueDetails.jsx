import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function IssueDetails() {
  const { id } = useParams();

  const [issue, setIssue] = useState(null);
  const [message, setMessage] = useState("Loading issue...");

  useEffect(() => {
    const fetchIssue = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("You must login first.");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/issues/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "Could not load issue.");
          return;
        }

        const issueData = Array.isArray(data) ? data[0] : data;

        setIssue(issueData);
        setMessage("");
      } catch (error) {
        console.error(error);
        setMessage("Could not connect to the server.");
      }
    };

    fetchIssue();
  }, [id]);

  if (message) {
    return (
      <div className="issue-details-page">
        <p>{message}</p>
      </div>
    );
  }

  if (!issue) {
    return null;
  }

  return (
    <div className="issue-details-page">
      <Link to="/issues" className="back-btn">
        ← Back to Issues
      </Link>

      <div className="issue-details-card">
        <div className="issue-details-heading">
          <div>
            <p className="dashboard-label">
              Issue #{issue.id}
            </p>

            <h1>{issue.title}</h1>
          </div>

          <span className="status-badge">
            {issue.status || "Submitted"}
          </span>
        </div>

        <div className="detail-section">
          <h3>Description</h3>
          <p>{issue.description || "No description provided."}</p>
        </div>

        <div className="detail-grid">
          <div>
            <span className="detail-label">Priority</span>
            <p>{issue.priority || "Normal"}</p>
          </div>

          <div>
            <span className="detail-label">Category</span>
            <p>
              {issue.category_name ||
                issue.category ||
                issue.category_id ||
                "N/A"}
            </p>
          </div>

          <div>
            <span className="detail-label">Status</span>
            <p>{issue.status || "Submitted"}</p>
          </div>

          <div>
            <span className="detail-label">Location</span>
            <p>{issue.location || "Not provided"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IssueDetails;