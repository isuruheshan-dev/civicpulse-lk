import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function OfficerDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [issues, setIssues] = useState([]);
  const [message, setMessage] = useState("Loading assigned issues...");
  const [actionMessage, setActionMessage] = useState("");

  const fetchAssignedIssues = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/officer/issues",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Failed to load assigned issues."
        );
        return;
      }

      setIssues(data);
      setMessage("");

    } catch (error) {
      console.error("Officer dashboard error:", error);

      setMessage("Could not connect to the server.");
    }
  };

  useEffect(() => {
    fetchAssignedIssues();
  }, []);

  const updateStatus = async (issueId, newStatus) => {
    try {
      setActionMessage("Updating issue...");

      const response = await fetch(
        `http://localhost:5000/api/officer/issues/${issueId}/status`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setActionMessage(
          data.message || "Failed to update issue."
        );
        return;
      }

      if (newStatus === "in_progress") {
        setActionMessage(
          `Issue #${issueId} is now In Progress.`
        );
      }

      if (newStatus === "resolved") {
        setActionMessage(
          `Issue #${issueId} has been resolved.`
        );
      }

      await fetchAssignedIssues();

    } catch (error) {
      console.error("Status update error:", error);

      setActionMessage(
        "Could not connect to the server."
      );
    }
  };

  const formatStatus = (status) => {
    if (status === "in_progress") {
      return "In Progress";
    }

    if (status === "assigned") {
      return "Assigned";
    }

    if (status === "resolved") {
      return "Resolved";
    }

    return status;
  };

  return (
    <div className="dashboard-page">

      <div className="dashboard-header">
        <div>
          <p className="dashboard-label">
            CivicPulse LK Field Officer
          </p>

          <h1>
            Welcome{" "}
            {user?.full_name ||
              user?.name ||
              "Field Officer"}{" "}
            👋
          </h1>

          <p>
            View your assigned reports and update their progress.
          </p>
        </div>
      </div>

      {actionMessage && (
        <p style={{ marginBottom: "20px" }}>
          {actionMessage}
        </p>
      )}

      <div className="dashboard-section">

        <h2>My Assigned Issues</h2>

        {message && <p>{message}</p>}

        {!message && issues.length === 0 && (
          <p>
            You currently have no assigned issues.
          </p>
        )}

        <div className="dashboard-cards">

          {issues.map((issue) => (
            <div
              className="dashboard-card"
              key={issue.id}
            >

              <p>Issue #{issue.id}</p>

              <h2>{issue.title}</h2>

              <p>
                Category: {issue.category || "Not available"}
              </p>

              <p>
                Priority: {issue.priority}
              </p>

              <p>
                Status: {formatStatus(issue.status)}
              </p>

              <p>
                {issue.description}
              </p>

              {issue.image_url && (
                <img
                  src={issue.image_url}
                  alt={issue.title}
                  style={{
                    width: "100%",
                    maxHeight: "220px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    marginBottom: "15px",
                  }}
                />
              )}

              <Link to={`/issues/${issue.id}`}>
                View Issue →
              </Link>

              <div style={{ marginTop: "20px" }}>

                {issue.status === "assigned" && (
                  <button
                    onClick={() =>
                      updateStatus(
                        issue.id,
                        "in_progress"
                      )
                    }
                  >
                    Start Work
                  </button>
                )}

                {issue.status === "in_progress" && (
                  <button
                    onClick={() =>
                      updateStatus(
                        issue.id,
                        "resolved"
                      )
                    }
                  >
                    Mark Resolved
                  </button>
                )}

                {issue.status === "resolved" && (
                  <strong>
                    ✅ Issue Resolved
                  </strong>
                )}

              </div>

            </div>
          ))}

        </div>
      </div>

    </div>
  );
}

export default OfficerDashboard;