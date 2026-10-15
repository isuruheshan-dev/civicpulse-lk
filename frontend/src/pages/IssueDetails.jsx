import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  MapContainer,
  TileLayer,
  Marker,
} from "react-leaflet";

function IssueDetails() {
  const { id } = useParams();

  const [issue, setIssue] = useState(null);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("Loading issue...");

  const workflow = [
    { key: "submitted", label: "Submitted" },
    { key: "assigned", label: "Assigned" },
    { key: "in_progress", label: "In Progress" },
    { key: "resolved", label: "Resolved" },
  ];

  const normalizeStatus = (status) => {
    return status
      ?.toLowerCase()
      .trim()
      .replace(/\s+/g, "_");
  };

  useEffect(() => {
    const fetchIssueDetails = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("You must login first.");
        return;
      }

      try {
        // Get issue
        const issueResponse = await fetch(
          `http://localhost:5000/api/issues/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const issueData = await issueResponse.json();

        if (!issueResponse.ok) {
          setMessage(issueData.message || "Could not load issue.");
          return;
        }

        const finalIssue = Array.isArray(issueData)
          ? issueData[0]
          : issueData;

        setIssue(finalIssue);

        // Get status history
        const historyResponse = await fetch(
          `http://localhost:5000/api/issues/${id}/history`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setHistory(historyData);
        } else {
          console.error("Could not load issue history.");
          setHistory([]);
        }

        setMessage("");
      } catch (error) {
        console.error(error);
        setMessage("Could not connect to the server.");
      }
    };

    fetchIssueDetails();
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

  const currentStatus = normalizeStatus(
    issue.status || "submitted"
  );

  const currentStatusIndex = workflow.findIndex(
    (step) => step.key === currentStatus
  );

  // PostgreSQL may return numeric values as strings,
  // so convert them to JavaScript numbers.
  const latitude =
    issue.latitude !== null && issue.latitude !== undefined
      ? Number(issue.latitude)
      : null;

  const longitude =
    issue.longitude !== null && issue.longitude !== undefined
      ? Number(issue.longitude)
      : null;

  const hasLocation =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

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

        {/* DESCRIPTION */}
        <div className="detail-section">
          <h3>Description</h3>

          <p>
            {issue.description ||
              "No description provided."}
          </p>
        </div>

        {/* DAY 7 - ISSUE PHOTO */}
        {issue.image_url && (
          <div className="detail-section">
            <h3>Issue Photo</h3>

            <img
              src={issue.image_url}
              alt={`Issue ${issue.id}`}
              style={{
                width: "100%",
                maxWidth: "650px",
                maxHeight: "450px",
                objectFit: "cover",
                borderRadius: "12px",
                marginTop: "10px",
              }}
            />
          </div>
        )}

        {/* BASIC DETAILS */}
        <div className="detail-grid">
          <div>
            <span className="detail-label">
              Priority
            </span>

            <p>{issue.priority || "Normal"}</p>
          </div>

          <div>
            <span className="detail-label">
              Category
            </span>

            <p>
              {issue.category_name ||
                issue.category ||
                issue.category_id ||
                "N/A"}
            </p>
          </div>

          <div>
            <span className="detail-label">
              Status
            </span>

            <p>{issue.status || "Submitted"}</p>
          </div>

          <div>
            <span className="detail-label">
              Location
            </span>

            <p>
              {hasLocation
                ? `${latitude}, ${longitude}`
                : "Not provided"}
            </p>
          </div>
        </div>

        {/* DAY 7 - ISSUE LOCATION MAP */}
        {hasLocation && (
          <div
            className="detail-section"
            style={{ marginTop: "30px" }}
          >
            <h3>Reported Location</h3>

            <MapContainer
              center={[latitude, longitude]}
              zoom={16}
              scrollWheelZoom={false}
              style={{
                width: "100%",
                height: "350px",
                borderRadius: "12px",
                marginTop: "10px",
              }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Marker
                position={[latitude, longitude]}
              />
            </MapContainer>
          </div>
        )}

        {/* WORKFLOW */}
        <div className="workflow-section">
          <h2>Issue Progress</h2>

          <div className="workflow">
            {workflow.map((step, index) => {
              const completed =
                currentStatusIndex >= 0 &&
                index <= currentStatusIndex;

              return (
                <div
                  className={`workflow-step ${
                    completed ? "completed" : ""
                  }`}
                  key={step.key}
                >
                  <div className="workflow-circle">
                    {completed ? "✓" : index + 1}
                  </div>

                  <span>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* STATUS HISTORY */}
        <div className="history-section">
          <h2>Status History</h2>

          {history.length === 0 ? (
            <p>No status history available.</p>
          ) : (
            <div className="history-list">
              {history.map((item) => (
                <div
                  className="history-item"
                  key={item.id}
                >
                  <div className="history-dot"></div>

                  <div>
                    <h3>
                      {item.status
                        ?.replaceAll("_", " ")
                        .replace(/\b\w/g, (letter) =>
                          letter.toUpperCase()
                        )}
                    </h3>

                    <p>
                      {item.note ||
                        "Status updated"}
                    </p>

                    <small>
                      Changed by:{" "}
                      {item.changed_by_name ||
                        `User #${item.changed_by}`}
                    </small>

                    <br />

                    <small>
                      {item.changed_at
                        ? new Date(
                            item.changed_at
                          ).toLocaleString()
                        : ""}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default IssueDetails;